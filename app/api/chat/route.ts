import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { index } from "@/lib/pinecone";
import { embedText } from "@/lib/embedding";

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();

    // 1. Get the latest question
    const lastUserMessage = messages[messages.length - 1];
    const userQuery = lastUserMessage?.parts?.[0]?.text || "";

    let contextText = "";

    if (userQuery) {
      // 2. Embed the question
      const queryEmbedding = await embedText(userQuery);

      // 3. Query Pinecone — no filter, search ALL bills
      const queryOptions = {
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
        filter: sessionId ? { sessionId: { $eq: sessionId } } : undefined,
      };

      const queryResponse = await index.query(queryOptions);


      queryResponse.matches?.forEach((match: any, idx: number) => {
        const score =
          match.score !== undefined
            ? `${(match.score * 100).toFixed(2)}%`
            : "N/A";
      });


      // 4. Build context from retrieved chunks
      contextText =
        queryResponse.matches
          ?.map((match: any) => match.metadata?.text as string)
          .filter(Boolean)
          .join("\n\n---\n\n") || "";
    }

    // 5. Build system prompt
    const systemPrompt = `
      You are a helpful telecom billing assistant.
      
      Use the following retrieved information from the uploaded bills to answer questions:
      ${contextText || "No relevant information found."}

      Guidelines:
      1. Answer naturally and conversationally.
      2. Only use the provided information — do not invent numbers.
      3. If answering a comparison question, reference specific bills by their details.
      4. If the answer cannot be found, politely say so.
      5. Never mention JSON, metadata, vectors, or technical terms.
      6. Use markdown formatting when it adds clarity:
        - Bullet points for lists or multiple items
        - Bold for important numbers or dates
        - Keep single-fact answers as plain text
        - Never use markdown for simple one-line answers
    `;

    // 6. Stream response
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
    });
  }
}
