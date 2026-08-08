export const AI_ASSISTANT_DISABLED_CODE = "AI_ASSISTANT_DISABLED";

export type AssistantAvailabilityPayload = {
  enabled: boolean;
  code?: string;
};

export function shouldShowAssistantLauncher(enabled: boolean): boolean {
  return enabled;
}

export function readAssistantAvailability(value: unknown): boolean | null {
  if (!value || typeof value !== "object" || typeof (value as { enabled?: unknown }).enabled !== "boolean") {
    return null;
  }
  return (value as AssistantAvailabilityPayload).enabled;
}
