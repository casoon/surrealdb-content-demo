import { pipeline } from "@huggingface/transformers";

// Mehrsprachiges Satzmodell, 384 Dimensionen, läuft lokal ohne API-Key.
export const MODEL = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
export const DIMENSION = 384;

const extractor = await pipeline("feature-extraction", MODEL, { dtype: "q8" });

export async function embed(text: string): Promise<number[]> {
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array, (v) => Number(v.toFixed(6)));
}
