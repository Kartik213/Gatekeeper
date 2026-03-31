export interface GatekeeperConfig {
  apiKey: string;
  baseUrl: string;
  cacheTtl?: number;
  timeout?: number;
  maxCacheSize?: number; 
}

export interface EvaluationContext {
  userId?: string;
  attributes?: Record<string, string>;
  defaultValue?: boolean;
}

export interface EvaluationResponse {
  enabled: boolean;
}
