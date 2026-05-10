import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { sendMessage as sendChatMessage } from "../api";
import { BrandSummary, Message } from "../types";

interface UseChatOptions {
  brandId?: string;
  initialMessages?: Message[];
  onSummaryUpdate?: (summary: BrandSummary) => void;
}

interface UseChatResult {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

function createTempMessage(brandId: string, role: Message["role"], content: string): Message {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brand_id: brandId,
    role,
    content,
    created_at: new Date().toISOString(),
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error ||
      error.message ||
      "We could not reach the backend right now. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while sending this message.";
}

export function useChat({
  brandId,
  initialMessages = [],
  onSummaryUpdate,
}: UseChatOptions): UseChatResult {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const brandIdRef = useRef<string | undefined>(brandId);

  useEffect(() => {
    brandIdRef.current = brandId;
    setMessages(initialMessages);
    setIsLoading(false);
    setError(null);
  }, [brandId, initialMessages]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!brandId || trimmed.length === 0 || isLoading) {
      return;
    }

    const activeBrandId = brandId;
    const optimisticUserMessage = createTempMessage(activeBrandId, "user", trimmed);

    setError(null);
    setIsLoading(true);
    setMessages((currentMessages) => [...currentMessages, optimisticUserMessage]);

    try {
      const result = await sendChatMessage(activeBrandId, trimmed);

      if (brandIdRef.current !== activeBrandId) {
        return;
      }

      const optimisticAssistantMessage = createTempMessage(activeBrandId, "assistant", result.response);

      setMessages((currentMessages) => [...currentMessages, optimisticAssistantMessage]);
      onSummaryUpdate?.(result.updated_summary);
    } catch (sendError) {
      if (brandIdRef.current !== activeBrandId) {
        return;
      }

      const friendlyMessage = getErrorMessage(sendError);

      setError(friendlyMessage);
      setMessages((currentMessages) => [
        ...currentMessages,
        createTempMessage(
          activeBrandId,
          "assistant",
          "I could not generate a brand response just now. Please try again in a moment.",
        ),
      ]);
    } finally {
      if (brandIdRef.current === activeBrandId) {
        setIsLoading(false);
      }
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
