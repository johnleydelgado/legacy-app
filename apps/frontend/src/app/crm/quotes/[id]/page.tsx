// File: src/app/crm/quotes/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import QuoteDetails from "@/components/pages/crm/quotes-details";
import { quotesService } from "@/services/quotes";
import QuoteDetailsSkeleton from "@/components/pages/crm/quotes-details/sections/skeleton";

interface QuoteDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// This is a Server Component that fetches data
async function getQuoteData(id: string) {
  try {
    const quote = await quotesService.getQuoteById(parseInt(id));
    return quote;
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    return null;
  }
}

export default async function QuoteDetailsPage({
  params,
}: QuoteDetailsPageProps) {
  const { id } = await params;

  // Validate that id is a number
  if (!id || isNaN(parseInt(id))) {
    notFound();
  }

  // Fetch quote data on the server
  const quote = await getQuoteData(id);

  if (!quote) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={<QuoteDetailsSkeleton />}>
        <QuoteDetails quote={quote} />
      </Suspense>
    </div>
  );
}

// Generate metadata for SEO (optional)
export async function generateMetadata({ params }: QuoteDetailsPageProps) {
  const { id } = await params;

  try {
    const quote = await getQuoteData(id);

    if (!quote) {
      return {
        title: "Quote Not Found",
        description: "The requested quote could not be found.",
      };
    }

    return {
      title: `Quote ${quote.quote_number || `#${id}`} - CRM`,
      description: `Quote details for ${quote.customer?.name || "customer"}`,
    };
  } catch (error) {
    return {
      title: "Quote Details - CRM",
      description: "View quote [id] and manage customer quotes.",
    };
  }
}
