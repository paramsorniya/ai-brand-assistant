import { Building2, Quote, Sparkles, Target, Tags, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BrandSummary } from "../types";

interface BrandSummaryPanelProps {
  brandName: string;
  summary: BrandSummary;
}

type SummaryKey =
  | "brand_name"
  | "tagline"
  | "target_audience"
  | "tone"
  | "industry"
  | "unique_selling_point"
  | "core_values"
  | "keywords";

function hasVisibleSummary(summary: BrandSummary): boolean {
  return Object.values(summary).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && String(value).trim().length > 0;
  });
}

function pillValues(values: string[] | null | undefined): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((value) => value.trim().length > 0);
}

export function BrandSummaryPanel({ brandName, summary }: BrandSummaryPanelProps) {
  const previousSummary = useRef<BrandSummary>(summary);
  const [highlightedKeys, setHighlightedKeys] = useState<SummaryKey[]>([]);

  useEffect(() => {
    const keys: SummaryKey[] = [
      "brand_name",
      "tagline",
      "target_audience",
      "tone",
      "industry",
      "unique_selling_point",
      "core_values",
      "keywords",
    ];

    const changedKeys = keys.filter(
      (key) => JSON.stringify(previousSummary.current[key]) !== JSON.stringify(summary[key]),
    );

    if (changedKeys.length > 0) {
      setHighlightedKeys(changedKeys);
      const timeoutId = window.setTimeout(() => setHighlightedKeys([]), 1400);
      previousSummary.current = summary;
      return () => window.clearTimeout(timeoutId);
    }

    previousSummary.current = summary;
    return undefined;
  }, [summary]);

  const sections = useMemo(
    () => [
      { key: "brand_name" as const, label: "Brand Name", icon: Building2, value: summary.brand_name },
      { key: "tagline" as const, label: "Tagline", icon: Quote, value: summary.tagline },
      { key: "target_audience" as const, label: "Target Audience", icon: Users, value: summary.target_audience },
      { key: "tone" as const, label: "Tone", icon: Sparkles, value: summary.tone },
      { key: "industry" as const, label: "Industry", icon: Target, value: summary.industry },
      {
        key: "unique_selling_point" as const,
        label: "Unique Selling Point",
        icon: Trophy,
        value: summary.unique_selling_point,
      },
    ],
    [summary],
  );

  const coreValues = pillValues(summary.core_values);
  const keywords = pillValues(summary.keywords);
  const hasSummary = hasVisibleSummary(summary);

  return (
    <aside className="relative z-10 w-full shrink-0 border-t border-border/70 bg-surface/70 backdrop-blur lg:w-[320px] lg:border-l lg:border-t-0">
      <div className="flex h-full max-h-[42vh] flex-col lg:max-h-none">
        <div className="border-b border-border/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-textPrimary">Brand Summary</p>
              <p className="text-sm text-textSecondary">{brandName}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin">
          {hasSummary ? (
            <>
              {sections.map((section) => {
                const Icon = section.icon;
                const isHighlighted = highlightedKeys.includes(section.key);
                const hasValue = section.value !== null && section.value !== undefined && section.value !== "";

                return (
                  <div
                    key={section.key}
                    className={`rounded-3xl border border-border bg-bg/45 p-4 transition ${
                      isHighlighted ? "animate-field-pulse border-accent/40" : ""
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-2 text-textSecondary">
                      <Icon size={16} />
                      <p className="text-xs font-semibold uppercase tracking-[0.2em]">{section.label}</p>
                    </div>
                    <p
                      className={`text-sm leading-7 ${
                        hasValue ? "text-textPrimary" : "text-textSecondary"
                      } ${section.key === "tagline" && hasValue ? "italic" : ""}`}
                    >
                      {hasValue ? section.value : "-"}
                    </p>
                  </div>
                );
              })}

              <div
                className={`rounded-3xl border border-border bg-bg/45 p-4 transition ${
                  highlightedKeys.includes("core_values") ? "animate-field-pulse border-accent/40" : ""
                }`}
              >
                <div className="mb-3 flex items-center gap-2 text-textSecondary">
                  <Sparkles size={16} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Core Values</p>
                </div>
                {coreValues.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {coreValues.map((value) => (
                      <span key={value} className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs text-textPrimary">
                        {value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-textSecondary">-</p>
                )}
              </div>

              <div
                className={`rounded-3xl border border-border bg-bg/45 p-4 transition ${
                  highlightedKeys.includes("keywords") ? "animate-field-pulse border-accent/40" : ""
                }`}
              >
                <div className="mb-3 flex items-center gap-2 text-textSecondary">
                  <Tags size={16} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Keywords</p>
                </div>
                {keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((value) => (
                      <span key={value} className="rounded-full border border-border bg-surfaceHover/70 px-3 py-1 text-xs text-textPrimary">
                        {value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-textSecondary">-</p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-[30px] border border-dashed border-border bg-bg/40 px-5 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/12 text-accent">
                <Sparkles size={28} />
              </div>
              <p className="mt-5 font-heading text-2xl font-bold text-textPrimary">No summary yet</p>
              <p className="mt-3 text-sm leading-7 text-textSecondary">
                The AI will update this panel as soon as the conversation starts locking in positioning, tone, and identity.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
