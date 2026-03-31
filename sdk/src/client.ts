import type {
  GatekeeperConfig,
  EvaluationContext,
  EvaluationResponse,
} from "./types";

interface CacheEntry {
  value: boolean;
  expiry: number;
}

export class GatekeeperClient {
  private apiKey: string;
  private baseUrl: string;
  private cacheTtl: number;
  private timeout: number;
  private maxCacheSize: number;
  private cache: Map<string, CacheEntry> = new Map();

  constructor(config: GatekeeperConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.cacheTtl = config.cacheTtl ?? 60000;
    this.timeout = config.timeout ?? 5000;
    this.maxCacheSize = config.maxCacheSize ?? 1000;
  }

  async isEnabled(
    flagName: string,
    context?: EvaluationContext
  ): Promise<boolean> {
    const params = new URLSearchParams({ flag: flagName });
    if (context?.userId) params.set("userId", context.userId);
    if (context?.attributes) params.set("attributes", JSON.stringify(context.attributes));

    // Cache key incorporates flagName, userId, and attributes
    const cacheKey = `${flagName}:${context?.userId || ""}:${JSON.stringify(context?.attributes || {})}`;

    // Return cached value if it's still fresh
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    const url = `${this.baseUrl}/api/v1/evaluate?${params.toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "x-api-key": this.apiKey },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gatekeeper: Evaluation failed (${response.status})`);
      }

      const data: EvaluationResponse = await response.json();
      
      // Enforce max cache size to prevent memory leaks
      if (this.cache.size >= this.maxCacheSize) {
        const now = Date.now();
        let deletedExpired = false;
        
        for (const [key, entry] of this.cache.entries()) {
          if (entry.expiry <= now) {
            this.cache.delete(key);
            deletedExpired = true;
          }
        }
        
        if (!deletedExpired && this.cache.size >= this.maxCacheSize) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey !== undefined) {
            this.cache.delete(firstKey);
          }
        }
      }

      // Save result to cache
      this.cache.set(cacheKey, {
        value: data.enabled,
        expiry: Date.now() + this.cacheTtl,
      });

      return data.enabled;
    } catch (error) {
      clearTimeout(timeoutId);
      // Fallback to defaultValue to prevent crashing the client application
      if (context?.defaultValue !== undefined) {
        console.warn(`Gatekeeper: API failed, falling back to defaultValue for ${flagName}. Reason:`, error);
        return context.defaultValue;
      }
      
      console.error(`Gatekeeper: API failed and no defaultValue provided for ${flagName}.`, error);
      return false;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
