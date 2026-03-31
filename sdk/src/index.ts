import { GatekeeperClient } from "./client";
import type { GatekeeperConfig, EvaluationContext } from "./types";

export function createClient(config: GatekeeperConfig) {
  return new GatekeeperClient(config);
}

export { GatekeeperClient };
export type { GatekeeperConfig, EvaluationContext };
