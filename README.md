# 🧠 AI Brand Assistant

> A conversational AI-powered brand identity builder that lets you create and manage multiple brands, each with their own isolated chat context and evolving brand summary.

🎥 **Loom Walkthrough:**
- Video 1 - https://www.loom.com/share/fcb5d9e7cc354a8393d964f2e2645092
- Video 2 - https://www.loom.com/share/748094b8ddd34428adf5c1b02a98ccf4

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Setup Instructions](#setup-instructions)
- [How to Use](#how-to-use)
- [API Reference](#api-reference)
- [Design Decisions](#design-decisions)
- [Limitations](#limitations)
- [Future Improvements](#future-improvements)

---

## Project Overview

### What the System Does

AI Brand Assistant is a full-stack web application where users can create multiple brands and have separate AI-powered conversations for each one. The AI acts as an expert brand strategist — helping define a brand's name, tagline, target audience, tone, core values, and positioning through natural back-and-forth conversation.

Each brand maintains its own isolated context. Refining one brand never affects another. The AI remembers everything discussed within a brand's conversation and builds on it with every new message.

### Key Features Implemented

- **Multi-Brand Management** — Create and manage multiple brands from a single dashboard
- **Isolated Chat Per Brand** — Every brand has its own independent conversation context
- **Rolling Summary Context** — AI context is stored as a structured brand summary that evolves with each message, not as raw chat history
- **Live Brand Summary Panel** — Real-time display of the brand identity being built (name, tagline, audience, tone, keywords, values)
- **Persistent Storage** — All brands, summaries, and chat messages are stored in PostgreSQL (Neon DB) and survive server restarts
- **Professional Chat UI** — Dark-themed, agency-style interface with typing indicators, auto-scroll, and smooth brand switching
- **Context-Aware AI Responses** — Every Groq API call includes the current brand summary so responses always build on previous inputs

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + Vite |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL via **Neon DB** (serverless, free tier) |
| **LLM Provider** | **Groq API** — model `llama-3.3-70b-versatile` |
| **HTTP Client** | Axios (frontend) |
| **DB Driver** | `@neondatabase/serverless` |

---

## Architecture Overview

### How Requests Flow Through the System

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│   Sidebar (brands)  │  Chat Window  │  Brand Summary Panel      │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP (Axios)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Express + TS)                      │
│                                                                 │
│   POST /api/brands     →   brand.service.ts  →  DB insert       │
│   GET  /api/brands     →   brand.service.ts  →  DB select       │
│   GET  /api/brands/:id →   brand.service.ts  →  DB select       │
│   POST /api/chat       →   llm.service.ts    →  Groq API        │
│                                                                 │
└──────────────┬───────────────────────────────┬─────────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│   PostgreSQL (Neon DB)   │     │        Groq API             │
│                          │     │   llama-3.3-70b-versatile   │
│   brands  (id, name,     │     │                             │
│           summary,       │     │  Input:  system prompt      │
│           timestamps)    │     │          + brand summary    │
│                          │     │          + user message     │
│   messages (id,          │     │                             │
│             brand_id,    │     │  Output: { reply,           │
│             role,        │     │    updated_summary }        │
│             content,     │     │                             │
│             created_at)  │     └─────────────────────────────┘
└──────────────────────────┘
```

### How Context is Stored and Retrieved

The system uses a **Rolling Summary** strategy instead of sending full chat history to the AI on every request.

**What is a Rolling Summary?**

Each brand has a `summary` column (JSONB) in the `brands` table. After every chat message, the AI returns an updated version of this summary. The backend saves it back to the DB. On the next message, this updated summary is sent as context to the AI again.

```
Message 1:
  User: "I want a fitness brand for young men"
  Summary before: {}
  Groq receives: empty summary + message
  Groq returns updated summary:
    { brand_name: "FORGED", tagline: "Built Different", audience: "Men 18-30" }
  Summary saved to DB ✓

Message 2:
  User: "Make it more luxurious"
  Summary before: { brand_name: "FORGED", tagline: "Built Different", ... }
  Groq receives: full current summary + new message
  Groq returns updated summary:
    { brand_name: "FORGED", tone: "Luxury, Elite", ... } ← only tone updated
  Summary saved to DB ✓
```

This means the AI always has the **full picture** of the brand without the token cost of sending every past message.

**Context Isolation:**
Every DB query is filtered by `brand_id`. Brand A's summary and messages are never fetched when working with Brand B. Switching brands in the UI loads a completely fresh context.

### How LLM is Integrated

The system prompt sent to Groq instructs it to:

1. Act as an expert brand strategist
2. Use the current brand summary as its foundation
3. Return a strict JSON response: `{ reply: string, updated_summary: object }`
4. Preserve all existing summary fields and only update what the user's message changes

The backend parses this JSON response, extracts the reply for the user and the updated summary for the DB.

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- A [Neon DB](https://neon.tech) account (free tier)
- A [Groq](https://console.groq.com) account (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/paramsorniya/ai-brand-assistant
cd ai-brand-assistant
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=your_neon_postgresql_connection_string
GROQ_API_KEY=your_groq_api_key
PORT=3001
```

**Getting your Neon DB connection string:**
1. Go to [neon.tech](https://neon.tech) → create a free project
2. Go to Dashboard → Connection Details
3. Copy the connection string (starts with `postgresql://`)

**Getting your Groq API key:**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with Google (free)
3. Go to API Keys → Create API Key
4. Copy the key (starts with `gsk_`)

Start the backend:

```bash
npm run dev
```

The server will start on `http://localhost:3001`. Database tables are auto-created on first startup.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`.

### 4. Verify Everything is Running

```bash
curl http://localhost:3001/api/health
# Expected: { "status": "ok" }
```

---

## How to Use

### Using the UI

1. Open `http://localhost:5173` in your browser
2. Click **"+ New Brand"** in the sidebar
3. Enter a brand name (e.g. "Fitness Brand") and confirm
4. Start chatting in the chat window
5. Watch the **Brand Summary Panel** on the right update in real time
6. Create a second brand and switch between them — context is fully isolated

### Testing Context Isolation

1. Create **Brand A** → chat: *"I want a fitness brand for young men"*
2. Create **Brand B** → chat: *"I want a luxury fashion brand for women"*
3. Switch back to **Brand A** → ask: *"What is our brand name?"*
4. The AI will respond with Brand A's identity only — Brand B's context is never mixed in

---

## API Reference

### Health Check

```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{ "status": "ok" }
```

---

### Create a Brand

```bash
curl -X POST http://localhost:3001/api/brands \
  -H "Content-Type: application/json" \
  -d '{"name": "Fitness Brand"}'
```

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Fitness Brand",
  "summary": {},
  "created_at": "2026-05-11T10:00:00Z"
}
```

---

### List All Brands

```bash
curl http://localhost:3001/api/brands
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "Fitness Brand",
    "summary": { "brand_name": "FORGED", "tagline": "Built Different" },
    "created_at": "2026-05-11T10:00:00Z"
  },
  {
    "id": "uuid-2",
    "name": "Fashion Brand",
    "summary": {},
    "created_at": "2026-05-11T10:05:00Z"
  }
]
```

---

### Get Brand with Chat History

```bash
curl http://localhost:3001/api/brands/your-brand-uuid-here
```

**Response:**
```json
{
  "brand": {
    "id": "uuid-1",
    "name": "Fitness Brand",
    "summary": {
      "brand_name": "FORGED",
      "tagline": "Built Different",
      "target_audience": "Men 18-30",
      "tone": "Premium, Aggressive"
    }
  },
  "messages": [
    { "role": "user", "content": "I want a fitness brand for young men" },
    { "role": "assistant", "content": "Great vision! Here's what I built..." }
  ]
}
```

---

### Send a Chat Message

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "your-brand-uuid-here", "message": "I want a fitness brand for young men"}'
```

**Response:**
```json
{
  "response": "Great vision! I've built the foundation of your brand. Meet FORGED...",
  "updated_summary": {
    "brand_name": "FORGED",
    "tagline": "Built Different",
    "target_audience": "Men aged 18-30, gym culture enthusiasts",
    "tone": "Premium, Aggressive, Motivational",
    "core_values": ["Performance", "Strength", "Exclusivity"],
    "keywords": ["fitness", "premium", "power", "elite"],
    "industry": "Fitness & Lifestyle"
  }
}
```

---

### Follow-up Message (Context-Aware)

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "your-brand-uuid-here", "message": "Make it more luxurious and also target women athletes"}'
```

The AI builds on the existing brand identity — it already knows the brand name, tagline, and audience — and only updates what you asked to change.

---

### Switch Brand (Context Isolation Test)

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"brand_id": "different-brand-uuid-here", "message": "I want a luxury fashion brand for Paris elite"}'
```

Using a different `brand_id` automatically loads that brand's own isolated context. No crossover with other brands.

---

## Design Decisions

### Why PostgreSQL (Neon DB) Instead of In-Memory Storage

In-memory storage was tempting for its simplicity but had a critical flaw: every server restart would wipe all brands and chat history. For a Loom demo or evaluator testing the API, this is a real problem.

Neon DB is a serverless PostgreSQL service with a generous free tier, zero configuration, and a connection string that works like any standard PostgreSQL DB. It gave us persistence with almost no extra setup cost compared to in-memory storage.

Additionally, storing data in PostgreSQL naturally enforces context isolation through `brand_id` foreign keys — there is no way for Brand A's data to appear in Brand B's queries.

### How Context Was Handled — Rolling Summary

The naive approach would be storing every message and sending the full chat history to Groq on each request. This has two problems:

1. **Token limits** — long conversations hit the model's context window
2. **Cost and latency** — more tokens = slower and more expensive responses

Instead, we implemented a **Rolling Summary** strategy:

- Each brand stores a structured JSON summary in the `brands` table
- After every AI response, Groq also returns an updated version of this summary
- The next request sends only this compact summary (not the full history)
- The AI is instructed in the system prompt to preserve all existing fields and only update what the user's new message changes

This means context is always complete (nothing is lost), always compact (fixed small size), and always structured (easy to display in the UI summary panel).

### Trade-offs Made

| Decision | Trade-off |
|---|---|
| Rolling Summary over full history | Loses exact conversation wording but preserves all meaningful brand information |
| Neon DB free tier | Slight cold-start latency on first connection, not suitable for high traffic |
| No authentication | All brands are globally visible — acceptable for this assignment, not for production |
| JSON response format from Groq | Occasionally returns malformed JSON; handled with try/catch fallback to old summary |

---

## Limitations

- **No Authentication** — All brands are shared globally. Any user accessing the app sees all brands. In production, each brand would be scoped to a `user_id` with JWT authentication.

- **No Rate Limiting** — The `/api/chat` endpoint has no rate limiting. Repeated rapid requests could exhaust the Groq free tier quota.

- **Groq JSON Reliability** — The AI is instructed to return strict JSON but occasionally wraps it in markdown code fences or adds preamble text. The backend handles this with cleanup and fallback logic, but edge cases may still occur.

- **No Streaming** — AI responses are returned as a complete block. For long responses there is a noticeable wait. Streaming would improve perceived performance significantly.

- **Single Global Context** — Because there is no auth, two people using the app simultaneously would see each other's brands and could overwrite summaries.

- **Neon Free Tier Limits** — Neon's free tier has compute and storage limits. Under high concurrent usage the DB connections could be throttled.

- **No Brand Deletion** — The current API does not include a DELETE endpoint for brands or messages.

---

## Future Improvements

### Short Term

- **Add Authentication** — JWT-based auth with `user_id` scoping on brands. Each user only sees and manages their own brands.
- **Streaming Responses** — Use Groq's streaming API to show AI responses word by word, dramatically improving UX.
- **Brand Deletion** — Add `DELETE /api/brands/:id` with cascade delete on messages.
- **Better JSON Parsing** — Add a retry mechanism if Groq returns malformed JSON instead of falling back silently.

### Medium Term

- **Response Caching** — Cache identical prompts (same summary + same message) using Redis to avoid redundant Groq API calls.
- **Summary Versioning** — Store a history of summary snapshots so users can see how the brand identity evolved over time.
- **Export Feature** — Allow users to export the final brand summary as a PDF brand brief.

### Long Term

- **Improved Prompt Design** — Fine-tune the system prompt with few-shot examples of excellent brand identities to get more creative and strategic AI responses.
- **Multi-User Collaboration** — Allow multiple users to collaborate on the same brand with real-time updates via WebSockets.
- **Scalability** — Replace Neon free tier with a dedicated PostgreSQL instance, add a load balancer, and horizontally scale the Express backend.
- **Brand Analytics** — Track how many iterations it took to finalize a brand, most common refinements, tone distribution across brands etc.

---

## Project Structure

```
ai-brand-assistant/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── db/
│   │   │   └── index.ts          # Neon DB client + table init
│   │   ├── routes/
│   │   │   ├── brands.ts         # Brand CRUD routes
│   │   │   └── chat.ts           # Chat route
│   │   ├── services/
│   │   │   ├── llm.service.ts    # Groq API integration
│   │   │   └── brand.service.ts  # DB operations
│   │   ├── utils/
│   │   │   └── promptBuilder.ts  # System prompt construction
│   │   └── types/
│   │       └── index.ts          # Shared TypeScript interfaces
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Root layout
│   │   ├── api/index.ts          # Axios API calls
│   │   ├── components/
│   │   │   ├── Sidebar.tsx       # Brand list + creation
│   │   │   ├── ChatWindow.tsx    # Message display
│   │   │   ├── ChatInput.tsx     # Message input
│   │   │   ├── MessageBubble.tsx # Individual message
│   │   │   └── BrandSummaryPanel.tsx  # Live summary
│   │   ├── hooks/
│   │   │   └── useChat.ts        # Chat state hook
│   │   └── types/index.ts
│   └── package.json
│
└── README.md
```

---

## Environment Variables Reference

| Variable | Location | Description |
|---|---|---|
| `DATABASE_URL` | backend/.env | Neon DB PostgreSQL connection string |
| `GROQ_API_KEY` | backend/.env | Groq API key (starts with `gsk_`) |
| `PORT` | backend/.env | Backend server port (default: 3001) |

> ⚠️ Never commit your `.env` file. It is listed in `.gitignore`.
