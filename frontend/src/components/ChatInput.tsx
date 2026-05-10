import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  disabled?: boolean;
  onSend: (message: string) => Promise<void>;
}

export function ChatInput({ disabled = false, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 112)}px`;
  }, [value]);

  async function handleSubmit() {
    const trimmed = value.trim();

    if (!trimmed || disabled) {
      return;
    }

    await onSend(trimmed);
    setValue("");
  }

  async function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSubmit();
    }
  }

  return (
    <div className="border-t border-border/80 bg-bg/90 px-4 py-4 sm:px-6">
      <div className="rounded-[28px] border border-border bg-surface/95 p-2 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Describe your brand vision..."
            className="max-h-28 min-h-[52px] flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-textPrimary outline-none placeholder:text-textSecondary disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={disabled || value.trim().length === 0}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-white transition hover:bg-accentHover disabled:cursor-not-allowed disabled:bg-surfaceHover disabled:text-textSecondary"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
