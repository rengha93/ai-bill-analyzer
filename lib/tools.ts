import { tool } from "ai";
import { z } from "zod";
import { getDb } from "@/lib/mongodb";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });

export const listBills = tool({
  description:
    "Lists all bills available for this session, with basic info like billId, billing period, and total amount due. Use this first when you need to know what bills exist before fetching details.",
  inputSchema: z.object({
    sessionId: z.string().describe("The current session ID"),
  }),
  execute: async ({ sessionId }) => {
    const db = await getDb();
    const bills = await db
      .collection("bills")
      .find({ sessionId })
      .project({
        billId: 1,
        "billingMetadata.billingPeriod": 1,
        "billingMetadata.dueDate": 1,
        "financialSummary.totalAmountDue": 1,
      })
      .toArray();

    return bills.map((b) => ({
      billId: b.billId,
      billingPeriod: b.billingMetadata?.billingPeriod,
      dueDate: b.billingMetadata?.dueDate,
      totalAmountDue: b.financialSummary?.totalAmountDue,
    }));
  },
});

export const getBillSummary = tool({
  description:
    "Returns the summary of a specific bill — total amount due, due date, billing period, plan name, and amount payable after due date if paid late.",
  inputSchema: z.object({
    billId: z.string().describe("The bill ID to fetch summary for"),
  }),
  execute: async ({ billId }) => {
    const db = await getDb();
    const bill = await db.collection("bills").findOne({ billId });

    if (!bill) return { error: "Bill not found" };

    return {
      planName: bill.planDetails?.planName,
      billingPeriod: bill.billingMetadata?.billingPeriod,
      dueDate: bill.billingMetadata?.dueDate,
      totalAmountDue: bill.financialSummary?.totalAmountDue,
      amountAfterDueDate: bill.financialSummary?.amountAfterDueDate,
    };
  },
});

export const getChargesBreakdown = tool({
  description:
    "Returns the detailed charges breakdown for a specific bill — rental, taxes, other charges, and itemized line items if available.",
  inputSchema: z.object({
    billId: z.string().describe("The bill ID to fetch charges breakdown for"),
  }),
  execute: async ({ billId }) => {
    const db = await getDb();
    const bill = await db.collection("bills").findOne({ billId });

    if (!bill) return { error: "Bill not found" };

    return bill.financialSummary?.currentCharges;
  },
});

export const compareBills = tool({
  description:
    "Compares totals and charges across two or more bills. Use this when the user asks to compare months, check if charges increased, etc.",
  inputSchema: z.object({
    billIds: z.array(z.string()).describe("List of bill IDs to compare"),
  }),
  execute: async ({ billIds }) => {
    const db = await getDb();
    const bills = await db
      .collection("bills")
      .find({ billId: { $in: billIds } })
      .toArray();

    return bills.map((b) => ({
      billId: b.billId,
      billingPeriod: b.billingMetadata?.billingPeriod,
      totalAmountDue: b.financialSummary?.totalAmountDue,
      currentCharges: b.financialSummary?.currentCharges,
    }));
  },
});

export const compareWithMarketPlans = tool({
  description: "Searches the web for current broadband/telecom plans from other providers, to compare against the user's current plan. Use this when the user asks if they're overpaying, wants to know about alternative plans/providers, or asks how their plan compares to the market.",
  inputSchema: z.object({
    currentSpeed: z.string().describe("User's current plan speed, e.g. '200 Mbps'"),
    currentPrice: z.number().describe("User's current monthly rental price, e.g. 999"),
    location: z.string().optional().describe("City, for location-relevant plans, e.g. 'Bangalore'"),
    providers: z.array(z.string()).optional().describe("Specific provider names mentioned by the user to compare against, e.g. ['Jio', 'ACT Fibernet']"),
  }),
  execute: async ({ currentSpeed, currentPrice, location, providers }) => {
    const majorProviders = "Jio Fiber Airtel ACT Fibernet";
    const providerHint = providers?.length ? providers.join(" ") : majorProviders;
    const query = `${providerHint} broadband internet plans ${currentSpeed} ${location || "India"} price 2026`;

    const response = await tvly.search(query, {
      maxResults: 5,
      searchDepth: "basic",
    });

    return {
      currentPlan: { speed: currentSpeed, price: currentPrice },
      searchResults: response.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content,
        publishedDate: r.publishedDate || "unknown",
      })),
      disclaimer: "These results are from a web search and may not reflect current pricing. Recommend verifying directly on the provider's official website.",
    };
  },
});