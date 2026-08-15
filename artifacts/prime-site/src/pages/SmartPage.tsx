import { ComponentType } from "react";

interface SmartPageProps {
  slug: string;
  fallback: ComponentType;
}

export default function SmartPage({ fallback: Fallback }: SmartPageProps) {
  return <Fallback />;
}
