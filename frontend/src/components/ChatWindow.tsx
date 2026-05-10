import { Bot, Loader2, Orbit } from "lucide-react";
import { useEffect, useRef } from "react";
import { Brand, Message } from "../types";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  brand: Brand;
  messages: Message[];
  isLoading?: boolean;
  isFetchingBrand?: boolean;
  error?: string | null;
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatWindow({
  brand,
  messages,
  isLoading = false,
  isFetchingBrand = false,
  error,
  onSendMessage,
}: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, isFetchingBrand]);

  return (
    <section className="relative z-10 flex min-h-0 flex-1 flex-col">
      <header className="border-b border-border/70 bg-surface/60 px-5 py-4 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-heading text-2xl font-bold tracking-tight text-textPrimary">{brand.name}</p>
                <p className="text-sm text-textSecondary">Rolling summary active for this brand workspace</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-bg/60 px-3 py-2 text-sm text-textSecondary">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            Context isolated
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 scrollbar-thin sm:px-6">
        {error ? (
          <div className="mb-4 rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {isFetchingBrand ? (
          <div className="flex h-full min-h-[280px] items-center justify-center">
            <div className="rounded-3xl border border-border bg-surface/90 px-6 py-5 text-center shadow-[0_20px_45px_rgba(0,0,0,0.25)]">
              <Loader2 className="mx-auto animate-spin text-accent" size={22} />
              <p className="mt-4 font-medium text-textPrimary">Loading brand context</p>
              <p className="mt-2 text-sm text-textSecondary">Pulling the latest messages and summary from storage.</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-[320px] items-center justify-center">
            <div className="max-w-xl rounded-[32px] border border-border bg-surface/80 px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/15 text-accent">
                <Orbit size={30} />
              </div>
              <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-textPrimary">
                Start shaping {brand.name}
              </h2>
              <p className="mt-4 text-sm leading-7 text-textSecondary">
                Describe the audience, the feeling you want the brand to create, or the category you want to win in.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading ? (
              <div className="flex justify-start">
                <div className="rounded-[24px] rounded-bl-md border border-border bg-surface px-4 py-3 text-textPrimary">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="h-2 w-2 animate-typing rounded-full bg-accent"
                          style={{ animationDelay: `${index * 140}ms` }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-textSecondary">Brand strategist is thinking</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <ChatInput disabled={isLoading || isFetchingBrand} onSend={onSendMessage} />
    </section>
  );
}
