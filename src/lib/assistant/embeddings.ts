import "server-only";

export const ASSISTANT_EMBEDDING_DIMENSIONS = 512;

export type GeneratedEmbedding = {
  vector: number[];
  model: string;
};

function embeddingConfig() {
  const apiKey = process.env.ASSISTANT_EMBEDDING_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.ASSISTANT_EMBEDDING_API_URL || "https://api.openai.com/v1/embeddings").replace(/\/+$/, "");
  const model = process.env.ASSISTANT_EMBEDDING_MODEL || "text-embedding-3-small";
  const timeoutMs = Math.min(15_000, Math.max(1_000, Number(process.env.ASSISTANT_EMBEDDING_TIMEOUT_MS || 6_000)));
  return { apiKey, baseUrl, model, timeoutMs };
}

export function vectorLiteral(vector: number[] | null | undefined): string | null {
  if (!vector?.length) return null;
  return `[${vector.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

export async function generateEmbeddings(inputs: string[]): Promise<Array<GeneratedEmbedding | null>> {
  const config = embeddingConfig();
  const cleanInputs = inputs.slice(0, 32).map((input) => input.replace(/\s+/g, " ").trim().slice(0, 8_000));
  if (!cleanInputs.length) return [];
  if (!config.apiKey) return cleanInputs.map(() => null);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const startedAt = Date.now();
  try {
    const response = await fetch(config.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: cleanInputs,
        model: config.model,
        dimensions: ASSISTANT_EMBEDDING_DIMENSIONS,
        encoding_format: "float",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`embedding_http_${response.status}`);
    const payload = await response.json() as {
      data?: Array<{ embedding?: unknown; index?: unknown }>;
      model?: unknown;
    };
    if (!Array.isArray(payload.data) || payload.data.length !== cleanInputs.length) {
      throw new Error("embedding_invalid_dimensions");
    }
    const ordered = [...payload.data].sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
    const vectors = ordered.map((item) => item.embedding);
    if (vectors.some((vector) => !Array.isArray(vector) || vector.length !== ASSISTANT_EMBEDDING_DIMENSIONS
      || vector.some((value) => typeof value !== "number" || !Number.isFinite(value)))) {
      throw new Error("embedding_invalid_dimensions");
    }
    const model = typeof payload.model === "string" ? payload.model : config.model;
    console.info(JSON.stringify({
      scope: "assistant_embeddings",
      event: "embedding_generated",
      model,
      dimensions: ASSISTANT_EMBEDDING_DIMENSIONS,
      count: vectors.length,
      latencyMs: Date.now() - startedAt,
      contentLogged: false,
    }));
    return vectors.map((vector) => ({ vector: vector as number[], model }));
  } catch (error) {
    console.warn(JSON.stringify({
      scope: "assistant_embeddings",
      event: "embedding_generation_failed",
      failureCode: error instanceof Error ? error.message.slice(0, 120) : "unknown_error",
      latencyMs: Date.now() - startedAt,
      contentLogged: false,
    }));
    return cleanInputs.map(() => null);
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateEmbedding(input: string): Promise<GeneratedEmbedding | null> {
  return (await generateEmbeddings([input]))[0] || null;
}
