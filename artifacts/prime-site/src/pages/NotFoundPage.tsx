import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { useSEO } from "../lib/useSEO";

export default function NotFoundPage() {
  useSEO({ title: "Page Not Found | Prime Packaging Boxes", description: "The page you are looking for does not exist.", noindex: true });

  return (
    <>
      <div className="container mx-auto px-4 py-32 flex flex-col items-center text-center justify-center flex-1">
        <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-8">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h1 className="text-5xl font-black mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-10">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex gap-4">
          <Link href="/" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-bold transition-colors shadow-sm">
            Return Home
          </Link>
          <Link href="/products" className="bg-muted hover:bg-muted/80 text-foreground px-8 py-3 rounded-lg font-bold transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    </>
  );
}