import Groq from "groq-sdk";
import { getRequiredEnv } from "../config/env";
import { BrandSummary, ChatResponse } from "../types";
import { buildSystemPrompt, buildUserMessage } from "../utils/promptBuilder";

const groq = new Groq({
  apiKey: getRequiredEnv("GROQ_API_KEY"),
});

function mergeSummaries(
  currentSummary: BrandSummary,
  nextSummary: BrandSummary,
): BrandSummary {
  const merged: BrandSummary = {
    ...currentSummary,
    ...nextSummary,
  };

  if (nextSummary.core_values !== undefined) {
    merged.core_values = nextSummary.core_values ?? [];
  }

  if (nextSummary.keywords !== undefined) {
    merged.keywords = nextSummary.keywords ?? [];
  }

  return merged;
}

function cleanJsonResponse(rawContent: string): string {
  return rawContent
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export async function getChatResponse(
  brandName: string,
  currentSummary: BrandSummary,
  userMessage: string,
): Promise<ChatResponse> {
  const systemPrompt = buildSystemPrompt(brandName, currentSummary);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: buildUserMessage(userMessage),
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: {
      type: "json_object",
    },
  });

  const rawContent = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = cleanJsonResponse(rawContent);

  try {
    const parsed = JSON.parse(cleaned) as Partial<ChatResponse>;

    if (
      typeof parsed.reply !== "string" ||
      typeof parsed.updated_summary !== "object" ||
      !parsed.updated_summary
    ) {
      throw new Error("Invalid response structure");
    }

    return {
      reply: parsed.reply,
      updated_summary: mergeSummaries(
        currentSummary,
        parsed.updated_summary as BrandSummary,
      ),
    };
  } catch (error) {
    console.error("Failed to parse Groq JSON response:", error);

    return {
      reply:
        typeof rawContent === "string" && rawContent.trim().length > 0
          ? rawContent.trim()
          : "I hit a formatting issue while updating this brand, but we can keep going from here.",
      updated_summary: currentSummary,
    };
  }
}
