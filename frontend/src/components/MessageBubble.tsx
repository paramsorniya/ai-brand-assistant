import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex animate-fade-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] sm:max-w-[72%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-[24px] px-4 py-3 text-sm leading-7 shadow-sm ${
            isUser
              ? "rounded-br-md bg-accent text-white"
              : "rounded-bl-md border border-border bg-surface text-textPrimary"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className="mt-2 px-1 text-xs text-textSecondary">{formatTime(message.created_at)}</span>
      </div>
    </div>
  );
}
