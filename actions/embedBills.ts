"use server";

import { index } from "@/lib/pinecone";
import { chunkText } from "@/lib/chunker";
import { extractText } from "unpdf";
import { embedText } from "@/lib/embedding";

export async function embedBillAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const billId = formData.get("billId") as string;

    if (!file || !billId) {
      return { success: false, error: "No file or billId provided" };
    }

    // 1. Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text } = await extractText(new Uint8Array(buffer));
    const fullText = text.join("\n");

    // 2. Chunk the text
    const chunks = chunkText(fullText);

    // 3. Embed each chunk + store in Pinecone
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await embedText(chunk);
      vectors.push({
        id: `${billId}_chunk_${i}`,
        values: embedding,
        metadata: { text: chunk, billId },
      });
    }

    await index.upsert({ records: vectors });

    return { success: true, billId, totalChunks: chunks.length };
  } catch (error) {
    console.error("Embed error:", error);
    return { success: false, error: "Failed to embed bill" };
  }
}
