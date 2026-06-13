"use server";

import { index } from "@/lib/pinecone";
import { chunkText } from "@/lib/chunker";
import { extractText } from "unpdf";
import { embedText } from "@/lib/embedding";
import { google } from "@ai-sdk/google";
import { telecomBillSchema } from "@/lib/schema";
import { getDb } from "@/lib/mongodb";
import { generateObject, generateText, Output } from "ai";

export async function embedBillAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const billId = formData.get("billId") as string;
    const sessionId = formData.get("sessionId") as string;

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
        metadata: { text: chunk, billId, sessionId },
      });
    }

    await index.upsert({ records: vectors });

    //4. Strcutured extraction using generateObjects()
    const { object: structuredData } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: telecomBillSchema,
      prompt: `Extract the billing details from the following telecom bill text:\n\n${fullText}`,
    });

    // 5. Save structured data to MongoDB
    const db = await getDb();
    await db.collection("bills").insertOne({
      billId,
      sessionId,
      ...structuredData,
      createdAt: new Date(),
    });

    return {
      success: true,
      billId,
      totalChunks: chunks.length,
      extracted: true,
    };
  } catch (error) {
    console.error("Embed error:", error);
    return { success: false, error: "Failed to embed bill" };
  }
}
