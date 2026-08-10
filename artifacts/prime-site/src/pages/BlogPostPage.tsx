import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, User, Calendar } from "lucide-react";
import { useGetBlogPost } from "@workspace/api-client-react";
import { useSEO, useSchemaOrg } from "../lib/useSEO";

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";

  const { data: post, isLoading, isError } = useGetBlogPost(slug, {
    query: { enabled: !!slug, queryKey: ["blogPost", slug] }
  });

  useSEO({
    title: post ? `${post.title} | Prime Packaging Boxes` : "Blog Post | Prime Packaging Boxes",
    description: post ? (post.excerpt || "Read our latest article").substring(0, 160) : "Packaging insights",
  });

  if (isLoading) {
    return (
      <>
        <div className="container mx-auto px-4 py-16 max-w-4xl animate-pulse">
          <div className="h-6 w-32 bg-muted rounded mb-8"></div>
          <div className="h-12 w-3/4 bg-muted rounded mb-4"></div>
          <div className="h-6 w-1/3 bg-muted rounded mb-12"></div>
          <div className="aspect-[21/9] w-full bg-muted rounded-2xl mb-12"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-5/6 bg-muted rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (isError || !post) {
    return (
      <>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you are looking for does not exist or has been removed.</p>
          <Link href="/blog" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium inline-block">
            Back to Blog
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <article className="pb-24">
        {/* ── Post Hero ── */}
        <section className="relative bg-[#0d1f3c] overflow-hidden min-h-[340px] flex items-center">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" style={{opacity:0.22}} loading="eager" decoding="async" onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
          ) : (
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=50" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{opacity:0.18}} loading="eager" decoding="async" onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
          )}
          <div className="absolute inset-0" style={{background:"linear-gradient(135deg,#0d1f3c 0%,rgba(13,31,60,0.85) 100%)"}} />
          <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",backgroundSize:"28px 28px"}} />
          <div className="container mx-auto px-4 py-14 relative z-10 max-w-4xl">
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <span className="inline-block bg-[#e63329]/15 border border-[#e63329]/30 text-[#ff6b63] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">Packaging Insights</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 max-w-3xl">{post.title}</h1>
            <div className="flex items-center gap-4 text-white/50 text-sm">
              {post.author && <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{post.author}</span>}
              {post.createdAt && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(post.createdAt), "MMMM d, yyyy")}</span>}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0"><svg viewBox="0 0 1440 36" fill="none" className="w-full block"><path d="M0 36 C480 0 960 0 1440 36 L1440 36 L0 36Z" fill="white"/></svg></div>
        </section>

        {/* Header (hidden — breadcrumb now in hero) */}
        <header className="container mx-auto px-4 pt-10 pb-4 max-w-4xl hidden">
          <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-medium mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
          </Link>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm font-medium">
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.createdAt ?? ""}>{post.createdAt ? format(new Date(post.createdAt), 'MMMM d, yyyy') : ""}</time>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="container mx-auto px-4 max-w-5xl mb-16">
            <div className="aspect-[21/9] md:aspect-[2.5/1] rounded-2xl overflow-hidden bg-muted">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = "https://placehold.co/1200x480/1a2f5a/ffffff?text=Prime+Packaging+Insights"; }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 max-w-3xl">
          {post.excerpt && (
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-12 leading-relaxed border-l-4 border-primary pl-6">
              {post.excerpt}
            </p>
          )}
          
          <div 
            className="prose prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content || "" }} 
          />
          
          {/* Share / Tags section could go here */}
          <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
            <Link href="/blog" className="inline-flex items-center text-primary font-bold hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Read more articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}