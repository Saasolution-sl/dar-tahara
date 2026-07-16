import test from "node:test";
import assert from "node:assert/strict";
import { buildProviderMessages } from "./provider";

test("provider prompt forces the confirmed language and preserves history exactly", () => {
  const history = [
    { role: "user" as const, content: "Bonjour, je m’appelle Noor. Réservation DTH-2607-10001." },
    { role: "assistant" as const, content: "Bonjour Noor !" },
  ];
  const messages = buildProviderMessages({
    channel: "website",
    locale: "fr",
    message: "Mon adresse est 12 Rue Atlas, noor@example.com.",
    conversationHistory: history,
  }, []);

  assert.match(messages[1].content, /Current conversation language:\nFrench/);
  assert.match(messages[1].content, /Always answer in French/);
  assert.deepEqual(messages.slice(3, 5), history);
  assert.equal(messages.at(-1)?.content, "Mon adresse est 12 Rue Atlas, noor@example.com.");
});
