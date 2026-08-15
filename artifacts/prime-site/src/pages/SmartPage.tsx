import { ComponentType } from "react";
import { useGetPage } from "@workspace/api-client-react";
import { BlockRenderer } from "../components/ui/BlockRenderer";

interface SmartPageProps {
  slug: string;
  fallback: ComponentType;
}

export default function SmartPage({ slug, fallback: Fallback }: SmartPageProps) {
  // Static pages are authored in the admin page manager and stored in the pages
  // table. Only use the legacy JSX page when the CMS record is unavailable.
  const { data: page, isLoading, isError } = useGetPage(slug, {
    query: { queryKey: ["page", slug] },
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1a2f5a] border-t-[#e63329] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isError && page?.content) {
    return <BlockRenderer content={page.content} />;
  }

  return <Fallback />;
}
