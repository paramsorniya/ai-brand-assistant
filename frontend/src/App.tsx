import axios from "axios";
import { startTransition, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { createBrand, fetchBrandById, fetchBrands } from "./api";
import { Brand, BrandSummary, Message } from "./types";
import { useChat } from "./hooks/useChat";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { BrandSummaryPanel } from "./components/BrandSummaryPanel";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function App() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<Message[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isBrandLoading, setIsBrandLoading] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const selectionRequestRef = useRef(0);

  async function loadBrandDetails(brandId: string, fallbackBrand?: Brand) {
    const requestId = ++selectionRequestRef.current;

    setAppError(null);
    setIsBrandLoading(true);

    startTransition(() => {
      setLoadedMessages([]);
      if (fallbackBrand) {
        setSelectedBrand(fallbackBrand);
      }
    });

    try {
      const response = await fetchBrandById(brandId);

      if (selectionRequestRef.current !== requestId) {
        return;
      }

      startTransition(() => {
        setSelectedBrand(response.brand);
        setBrands((currentBrands) => {
          const existingBrand = currentBrands.some((brand) => brand.id === response.brand.id);

          if (!existingBrand) {
            return [response.brand, ...currentBrands];
          }

          return currentBrands.map((brand) => (brand.id === response.brand.id ? response.brand : brand));
        });
        setLoadedMessages(response.messages);
      });
    } catch (error) {
      if (selectionRequestRef.current !== requestId) {
        return;
      }

      setAppError(getErrorMessage(error, "Unable to load this brand right now."));
    } finally {
      if (selectionRequestRef.current === requestId) {
        setIsBrandLoading(false);
      }
    }
  }

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      setIsBootstrapping(true);
      setAppError(null);

      try {
        const initialBrands = await fetchBrands();

        if (!isActive) {
          return;
        }

        setBrands(initialBrands);

        if (initialBrands[0]) {
          await loadBrandDetails(initialBrands[0].id, initialBrands[0]);
        } else {
          startTransition(() => {
            setSelectedBrand(null);
            setLoadedMessages([]);
          });
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setAppError(getErrorMessage(error, "Unable to load your brands right now."));
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => {
      isActive = false;
      selectionRequestRef.current += 1;
    };
  }, []);

  function updateBrandSummary(updatedSummary: BrandSummary) {
    const activeBrandId = selectedBrand?.id;

    if (!activeBrandId) {
      return;
    }

    const now = new Date().toISOString();

    startTransition(() => {
      setSelectedBrand((currentBrand) =>
        currentBrand ? { ...currentBrand, summary: updatedSummary, updated_at: now } : currentBrand,
      );
      setBrands((currentBrands) =>
        currentBrands.map((brand) =>
          brand.id === activeBrandId ? { ...brand, summary: updatedSummary, updated_at: now } : brand,
        ),
      );
    });
  }

  const { messages, isLoading: isChatLoading, error: chatError, sendMessage } = useChat({
    brandId: selectedBrand?.id,
    initialMessages: loadedMessages,
    onSummaryUpdate: updateBrandSummary,
  });

  async function handleCreateBrand(name: string) {
    setAppError(null);

    try {
      const brand = await createBrand(name);

      selectionRequestRef.current += 1;

      startTransition(() => {
        setBrands((currentBrands) => [brand, ...currentBrands.filter((currentBrand) => currentBrand.id !== brand.id)]);
        setSelectedBrand(brand);
        setLoadedMessages([]);
        setIsBrandLoading(false);
      });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create that brand right now.");
      setAppError(message);
      throw new Error(message);
    }
  }

  function handleSelectBrand(brandId: string) {
    const fallbackBrand = brands.find((brand) => brand.id === brandId);
    void loadBrandDetails(brandId, fallbackBrand);
  }

  const showEmptyState = !selectedBrand && !isBootstrapping;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg font-body text-textPrimary">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.20),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(91,82,232,0.16),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,_rgba(18,18,26,0.94),_rgba(18,18,26,0))]" />

      <div className="relative z-10 flex min-h-screen flex-col lg:h-screen lg:flex-row">
        <Sidebar
          brands={brands}
          selectedBrandId={selectedBrand?.id}
          isLoading={isBootstrapping || isBrandLoading}
          onSelectBrand={handleSelectBrand}
          onCreateBrand={handleCreateBrand}
        />

        <main className="relative flex min-h-[45vh] flex-1 flex-col overflow-hidden">
          {appError ? (
            <div className="border-b border-danger/30 bg-danger/10 px-5 py-3 text-sm text-rose-200 sm:px-6">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{appError}</span>
              </div>
            </div>
          ) : null}

          {isBootstrapping ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="rounded-[32px] border border-border bg-surface/85 px-8 py-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
                <Loader2 className="mx-auto animate-spin text-accent" size={26} />
                <p className="mt-4 font-heading text-3xl font-bold tracking-tight text-textPrimary">Preparing your workspace</p>
                <p className="mt-3 text-sm leading-7 text-textSecondary">
                  Loading brands, summaries, and the latest context from the backend.
                </p>
              </div>
            </div>
          ) : showEmptyState ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10">
              <div className="max-w-2xl rounded-[36px] border border-border bg-surface/80 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:p-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/15 text-accent">
                  <Sparkles size={28} />
                </div>
                <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-textPrimary">
                  Build a brand with live strategic memory
                </h1>
                <p className="mt-4 text-base leading-8 text-textSecondary">
                  Create a brand workspace, talk through its identity, and let the assistant keep a rolling summary of the audience, tone, positioning, and messaging as the strategy evolves.
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-textSecondary">
                  <ArrowRight size={16} className="text-accent" />
                  Use the sidebar to create your first brand.
                </div>
              </div>
            </div>
          ) : selectedBrand ? (
            <ChatWindow
              brand={selectedBrand}
              messages={messages}
              isLoading={isChatLoading}
              isFetchingBrand={isBrandLoading}
              error={chatError}
              onSendMessage={sendMessage}
            />
          ) : null}
        </main>

        {selectedBrand ? <BrandSummaryPanel brandName={selectedBrand.name} summary={selectedBrand.summary || {}} /> : null}
      </div>
    </div>
  );
}
