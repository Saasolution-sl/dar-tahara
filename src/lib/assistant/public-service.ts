import "server-only";

import { answerAssistant } from "./service";
import type { AssistantInput, AssistantReply } from "./types";
import { AI_ASSISTANT_DISABLED_CODE } from "./availability-state";

export { AI_ASSISTANT_DISABLED_CODE } from "./availability-state";

export class AssistantDisabledError extends Error {
  readonly code = AI_ASSISTANT_DISABLED_CODE;

  constructor() {
    super(AI_ASSISTANT_DISABLED_CODE);
    this.name = "AssistantDisabledError";
  }
}

export type PublicAssistantDependencies = {
  isEnabled: () => Promise<boolean>;
  answer: (input: AssistantInput) => Promise<AssistantReply>;
};

const defaultDependencies: PublicAssistantDependencies = {
  isEnabled: async () => {
    // Keep Next navigation modules out of the assistant core/test graph. The
    // application feature module is loaded only for real public requests.
    const { featureEnabled } = await import("@/lib/feature-flags");
    return featureEnabled("ai_assistant_enabled");
  },
  answer: answerAssistant,
};

/**
 * Authoritative entry point for customer-facing AI generation.
 *
 * Every message checks the persistent feature flag before the assistant
 * service, retrieval pipeline, tools, or configured LLM provider can run.
 */
export async function answerPublicAssistant(
  input: AssistantInput,
  dependencies: PublicAssistantDependencies = defaultDependencies,
): Promise<AssistantReply> {
  if (!await dependencies.isEnabled()) throw new AssistantDisabledError();
  return dependencies.answer(input);
}

export function isAssistantDisabledError(error: unknown): error is AssistantDisabledError {
  return error instanceof AssistantDisabledError
    || (error instanceof Error && error.message === AI_ASSISTANT_DISABLED_CODE);
}
