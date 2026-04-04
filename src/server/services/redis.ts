import { redis } from "@/lib/redis";

const FLAG_CACHE_TTL = 60; // seconds

export interface CachedFlag {
  enabled: boolean;
  rolloutPercentage: number;
  rules: Array<{
    attribute: string;
    operator: string;
    value: string;
  }>;
}

function flagCacheKey(projectId: string, flagName: string): string {
  return `flag:${projectId}:${flagName}`;
}

export async function getCachedFlag(
  projectId: string,
  flagName: string,
): Promise<CachedFlag | null> {
  if (!redis) return null;
  const data = await redis.get<CachedFlag>(flagCacheKey(projectId, flagName));
  return data;
}

export async function setCachedFlag(
  projectId: string,
  flagName: string,
  flag: CachedFlag,
): Promise<void> {
  if (!redis) return;
  await redis.set(flagCacheKey(projectId, flagName), flag, {
    ex: FLAG_CACHE_TTL,
  });
}

export async function invalidateFlagCache(projectId: string, flagName: string): Promise<void> {
  if (!redis) return;
  await redis.del(flagCacheKey(projectId, flagName));
}
