import { createHash } from "crypto";
import { db } from "@/lib/prisma";
import { getCachedFlag, setCachedFlag, type CachedFlag } from "./redis";

function hashUserId(userId: string): number {
  const hash = createHash("md5").update(userId).digest("hex");
  return parseInt(hash.slice(0, 8), 16) % 100;
}

function evaluateRule(
  rule: CachedFlag["rules"][number],
  attributes: Record<string, string>,
): boolean {
  const attrValue = attributes[rule.attribute];
  if (attrValue === undefined) return false;

  switch (rule.operator) {
    case "equals":
      return attrValue === rule.value;
    case "not_equals":
      return attrValue !== rule.value;
    case "contains":
      return attrValue.includes(rule.value);
    case "starts_with":
      return attrValue.startsWith(rule.value);
    case "ends_with":
      return attrValue.endsWith(rule.value);
    case "in":
      return rule.value
        .split(",")
        .map((v) => v.trim())
        .includes(attrValue);
    default:
      return false;
  }
}

export async function evaluateFlag(
  projectId: string,
  flagName: string,
  userId?: string,
  attributes?: Record<string, string>,
): Promise<boolean> {
  // 1. Try cache first
  let flagData = await getCachedFlag(projectId, flagName);

  // 2. Fallback to DB
  if (!flagData) {
    const flag = await db.featureFlag.findUnique({
      where: { projectId_name: { projectId, name: flagName } },
      include: { rules: true },
    });

    if (!flag) return false;

    flagData = {
      enabled: flag.enabled,
      rolloutPercentage: flag.rolloutPercentage,
      rules: flag.rules.map((r) => ({
        attribute: r.attribute,
        operator: r.operator,
        value: r.value,
      })),
    };

    // Cache for next time
    await setCachedFlag(projectId, flagName, flagData);
  }

  // 3. Check if flag is enabled at all
  if (!flagData.enabled) return false;

  // 4. If rules exist, evaluation context must match at least one rule.
  if (flagData.rules.length > 0) {
    if (!attributes) return false;

    const ruleMatch = flagData.rules.some((rule) => evaluateRule(rule, attributes));

    if (!ruleMatch) return false;
  }

  // 5. Evaluate rollout percentage
  if (userId && flagData.rolloutPercentage < 100) {
    const bucket = hashUserId(userId);
    return bucket < flagData.rolloutPercentage;
  }

  // 6. If rollout is 100% and flag is enabled, return true
  return flagData.rolloutPercentage === 100;
}
