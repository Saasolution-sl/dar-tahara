import test from "node:test";
import assert from "node:assert/strict";
import {
  AI_ASSISTANT_DISABLED_CODE,
  answerPublicAssistant,
  isAssistantDisabledError,
} from "./public-service";
import type { AssistantInput, AssistantReply } from "./types";

const input: AssistantInput = {
  channel: "website",
  locale: "en",
  message: "How does the first visit work?",
};

const reply = { answer: "Enabled response" } as AssistantReply;

test("enabled public assistant requests reach the existing assistant service", async () => {
  let calls = 0;
  const result = await answerPublicAssistant(input, {
    isEnabled: async () => true,
    answer: async () => {
      calls += 1;
      return reply;
    },
  });

  assert.equal(result, reply);
  assert.equal(calls, 1);
});

test("disabled public assistant requests are rejected before the provider pipeline is invoked", async () => {
  let calls = 0;

  await assert.rejects(
    answerPublicAssistant(input, {
      isEnabled: async () => false,
      answer: async () => {
        calls += 1;
        return reply;
      },
    }),
    (error: unknown) => isAssistantDisabledError(error)
      && error.message === AI_ASSISTANT_DISABLED_CODE,
  );
  assert.equal(calls, 0);
});

test("an already-open conversation cannot bypass a later disable", async () => {
  const states = [true, false];
  let calls = 0;
  const dependencies = {
    isEnabled: async () => states.shift() ?? false,
    answer: async () => {
      calls += 1;
      return reply;
    },
  };

  await answerPublicAssistant(input, dependencies);
  await assert.rejects(answerPublicAssistant(input, dependencies), isAssistantDisabledError);
  assert.equal(calls, 1);
});
