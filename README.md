# AI Bill Analyzer

An AI-powered telecom bill analysis agent — combining RAG, structured data extraction, and tool-calling to answer questions, compute exact totals, compare bills, and even check your plan against the market. Built with Next.js, Google Gemini, Pinecone, and MongoDB.

## Screenshots

### Upload

![Upload Screen](./public/mvp2_upload.png)

### Chat

![Chat Screen](./public/mvp2_chat.png)

## Features

- 📄 Upload multiple telecom bills as PDF, JPG, or PNG
- 🔍 Full RAG pipeline — PDF extraction, chunking, vector embeddings, Pinecone storage
- 🧩 Structured data extraction — bill totals, dates, and charges parsed into a typed schema and stored in MongoDB
- 🤖 Agentic tool-calling — model decides when to fetch exact data vs. retrieve explanatory context
- 💬 Streaming conversational Q&A across all uploaded bills
- 🧠 Semantic search — surfaces fine-print details (late fees, GST breakdown, payment terms)
- 📊 Cross-document queries — compare totals and charges across multiple bills
- 🌐 Market comparison — web search (Tavily) to check your plan against current provider offers, with sourced disclaimers
- 🔒 Session-isolated retrieval — no data pollution across sessions
- ⚡ Token-efficient — file never re-sent during chat, only relevant chunks and tool results are used

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **AI SDK** — Vercel AI SDK v6
- **LLM** — Google Gemini 2.5 Flash
- **Embeddings** — Google Gemini Embeddings
- **Vector DB** — Pinecone (RAG)
- **Structured DB** — MongoDB (extracted bill data)
- **Web Search** — Tavily (market plan comparison)
- **Validation/Schema** — Zod
- **Styling** — Tailwind CSS v4

## Architecture

```
Upload PDF/Image
│
└── Text extraction (unpdf)
      │
      ├── Chunking → Google Embeddings → Pinecone (RAG store)
      │
      └── Structured extraction (Zod schema) → MongoDB

User asks question
│
├── Pinecone semantic search → retrieved chunks (context for explanations)
│
└── Agent (Gemini 2.5 Flash) — decides:
      │
      ├── Answer from retrieved context (RAG)
      │
      ├── Call tools for exact data:
      │     ├── listBills
      │     ├── getBillSummary
      │     ├── getChargesBreakdown
      │     ├── compareBills
      │     └── compareWithMarketPlans (web search)
      │
      └── Combine RAG + tool results
            │
            └── Streaming response
```

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key — [Get one here](https://aistudio.google.com)
- Pinecone account — [Get one here](https://pinecone.io) (free tier)
- MongoDB Atlas account — [Get one here](https://mongodb.com/cloud/atlas) (free tier)
- Tavily account — [Get one here](https://tavily.com) (free tier)

### Installation

```bash
git clone https://github.com/rengha93/ai-bill-analyzer.git
cd ai-bill-analyzer
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
MONGODB_URI=your_mongodb_connection_string
TAVILY_API_KEY=your_tavily_api_key
```

### Pinecone Setup

Create an index in the Pinecone dashboard:

- **Name:** `bill-analyzer`
- **Dimensions:** `3072`
- **Metric:** `cosine`

### MongoDB Setup

Create a free M0 cluster on MongoDB Atlas. The app automatically creates the `bill-analyzer` database and `bills` collection on first use — no manual setup of collections required.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Roadmap

- [x] MVP 1.0 — Single bill extraction + streaming Q&A
- [x] MVP 2.0 — Multi-document RAG pipeline with Pinecone + semantic search
- [x] MVP 3.0 — Structured extraction (MongoDB) + agentic tool-calling + multi-step reasoning + market comparison via web search
