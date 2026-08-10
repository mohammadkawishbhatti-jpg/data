/**
 * SmartPage — always renders the React fallback component on the frontend.
 * DB page content is reserved for the admin page builder (read/write in admin panel).
 * The React component is the single source of truth for the live website.
 *
 * To edit a page in the builder, open Admin → Pages → Builder.
 * Builder changes are saved to DB but DO NOT override the live React page.
 */
import { ComponentType } from "react";

interface SmartPageProps {
  /** DB page slug (e.g. "about-us") — kept for future publish/override feature */
  slug: string;
  /** The React component that renders the live page */
  fallback: ComponentType;
}

export default function SmartPage({ fallback: Fallback }: SmartPageProps) {
  // Always render the React component. DB content is for the admin builder only.
  return <Fallback />;
}
