import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { index } from "@/lib/pinecone";
import { embedText } from "@/lib/embedding";
import {
  compareBills,
  compareWithMarketPlans,
  getBillSummary,
  getChargesBreakdown,
  listBills,
} from "@/lib/tools";

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

      The current session ID is: ${sessionId}

      You have access to the following tools for exact numbers and computations:
      - listBills: lists all bills available in this session
      - getBillSummary: returns total due, due date, and billing period for a specific bill
      - getChargesBreakdown: returns the detailed charge breakdown for a specific bill
      - compareBills: compares totals and charges across multiple bills

      Use the following retrieved information from the uploaded bills to answer questions:
      ${contextText || "No relevant information found."}

      Guidelines:
        1. Answer naturally and conversationally.
        2. Only use the provided information — do not invent numbers.
        3. If answering a comparison question, reference specific bills by their details.
        4. If the answer cannot be found, politely say so.
        5. Never mention JSON, metadata, vectors, or technical terms.
        6. For exact numbers, totals, or comparisons — use the tools rather than guessing from text.
        7. For explanations or policy-related questions — use the retrieved context above.
        8. If a question needs both — combine tool results and retrieved context in your answer.
        9. If you don't know what bills exist, call listBills first.
        10. Use markdown formatting when it adds clarity:
          - Bullet points for lists or multiple items
          - Bold for important numbers or dates
          - Keep single-fact answers as plain text
          - Never use markdown for simple one-line answers
        11. If the user refers to "this month", "my latest bill", "current bill", 
            or doesn't specify which bill, default to the MOST RECENT bill 
            (by billing period), answer using it, and mention which billing 
            period you used — so the user can clarify if they meant a different one.
        12. compareWithMarketPlans gives web search results about other providers' plans. These may be outdated — when using this:
            - Mention this information is from a web search, not verified real-time data
            - Include the source name/URL when citing a specific plan or price
            - Recommend the user verify on the provider's official website before switching
            - Never present competitor prices as guaranteed/current — use words like "around", "approximately"
        13. Use compareWithMarketPlans only when the user asks about other providers, switching plans, or whether they're overpaying compared to market rates. Use getBillSummary first if you need the user's current speed/price.
    `;

    // 6. Stream response
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: { listBills, getBillSummary, getChargesBreakdown, compareBills, compareWithMarketPlans },
      stopWhen: ({ steps }) => steps.length >= 5
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
    });
  }
}
