import { Request, Response, Router } from "express";
import { getBrandById, saveMessage, updateBrandSummary } from "../services/brand.service";
import { getChatResponse } from "../services/llm.service";

const router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function getProviderErrorDetails(error: unknown): {
  status: number;
  message: string;
} | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const providerError = error as {
    status?: number;
    error?: {
      error?: {
        message?: string;
        code?: string;
      };
    };
  };

  if (providerError.status === 401) {
    const providerMessage = providerError.error?.error?.message || "Invalid API Key";
    return {
      status: 502,
      message: `Groq authentication failed: ${providerMessage}. Check GROQ_API_KEY in backend/.env.`,
    };
  }

  if (providerError.status === 429) {
    return {
      status: 502,
      message: "Groq rate limit reached. Please wait a moment and try again.",
    };
  }

  return null;
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { brand_id, message } = req.body as {
      brand_id?: unknown;
      message?: unknown;
    };

    if (typeof brand_id !== "string" || typeof message !== "string") {
      return res.status(400).json({ error: "brand_id and message are required" });
    }

    if (!isValidUuid(brand_id)) {
      return res.status(400).json({ error: "Invalid brand_id format" });
    }

    if (message.trim().length === 0) {
      return res.status(400).json({ error: "message cannot be empty" });
    }

    const brand = await getBrandById(brand_id);

    if (!brand) {
      return res.status(404).json({ error: "Brand not found" });
    }

    const trimmedMessage = message.trim();

    await saveMessage(brand_id, "user", trimmedMessage);

    const { reply, updated_summary } = await getChatResponse(
      brand.name,
      brand.summary || {},
      trimmedMessage,
    );

    await updateBrandSummary(brand_id, updated_summary);
    await saveMessage(brand_id, "assistant", reply);

    return res.status(200).json({
      response: reply,
      updated_summary,
    });
  } catch (error) {
    console.error("Failed to process chat message:", error);

    const providerError = getProviderErrorDetails(error);

    if (providerError) {
      return res.status(providerError.status).json({ error: providerError.message });
    }

    return res.status(500).json({ error: "Unable to process this chat message right now" });
  }
});

export default router;
