import { Loader2, Plus, Sparkles } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Brand } from "../types";

interface SidebarProps {
  brands: Brand[];
  selectedBrandId?: string;
  isLoading?: boolean;
  onSelectBrand: (brandId: string) => void;
  onCreateBrand: (name: string) => Promise<void>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function Sidebar({
  brands,
  selectedBrandId,
  isLoading = false,
  onSelectBrand,
  onCreateBrand,
}: SidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const hasBrands = brands.length > 0;
  const sortedBrands = useMemo(() => brands, [brands]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (draftName.trim().length === 0) {
      setLocalError("Enter a brand name to get started.");
      return;
    }

    try {
      setLocalError(null);
      await onCreateBrand(draftName.trim());
      setDraftName("");
      setIsCreating(false);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Unable to create this brand right now.");
    }
  }

  return (
    <aside className="relative z-10 flex w-full shrink-0 flex-col border-b border-border/70 bg-surface/80 backdrop-blur lg:w-[280px] lg:border-b-0 lg:border-r">
      <div className="border-b border-border/70 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent shadow-accent">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-heading text-xl font-bold tracking-tight text-textPrimary">BrandMind</p>
            <p className="text-sm text-textSecondary">AI brand strategy workspace</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreating((current) => !current);
            setLocalError(null);
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accentHover"
        >
          <Plus size={16} />
          New Brand
        </button>

        {isCreating ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-2xl border border-border bg-bg/50 p-3">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Enter a brand name"
              className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-textPrimary outline-none transition placeholder:text-textSecondary focus:border-accent"
            />
            {localError ? <p className="text-sm text-danger">{localError}</p> : null}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accentHover"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setDraftName("");
                  setLocalError(null);
                }}
                className="rounded-xl border border-border px-3 py-2 text-sm text-textSecondary transition hover:border-accent hover:text-textPrimary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        <div className="mb-3 flex items-center justify-between px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">Brands</p>
          {isLoading ? <Loader2 className="animate-spin text-textSecondary" size={14} /> : null}
        </div>

        {hasBrands ? (
          <div className="space-y-2">
            {sortedBrands.map((brand) => {
              const isActive = brand.id === selectedBrandId;

              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => onSelectBrand(brand.id)}
                  className={`group w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-accent/40 bg-accent/10 shadow-accent"
                      : "border-transparent bg-transparent hover:border-border hover:bg-surfaceHover/70"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-heading text-sm font-bold ${
                        isActive ? "bg-accent text-white" : "bg-bg/70 text-textPrimary"
                      }`}
                    >
                      {brand.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-textPrimary">{brand.name}</p>
                        {isActive ? <span className="h-2 w-2 rounded-full bg-accent" /> : null}
                      </div>
                      <p className="mt-1 text-sm text-textSecondary">Created {formatDate(brand.created_at)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-bg/40 px-4 py-6 text-center">
            <p className="font-medium text-textPrimary">No brands yet</p>
            <p className="mt-2 text-sm leading-6 text-textSecondary">
              Create your first workspace to start shaping a voice, audience, and identity.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
