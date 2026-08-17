import { ReactNode, useEffect, useRef } from "react";
import { applyInlineOverrides } from "../../lib/inlineContent";

export function InlinePageOverrides({
  overrides,
  children,
}: {
  overrides: Record<string, string>;
  children: ReactNode;
}) {
  const appliedSignatureRef = useRef("");
  useEffect(() => {
    const signature = JSON.stringify(overrides);
    if (appliedSignatureRef.current === signature) return;
    const root = document.querySelector<HTMLElement>("[data-inline-page-root]");
    if (!root) return;
    const applied = applyInlineOverrides(root, overrides);
    if (applied === Object.keys(overrides).length) appliedSignatureRef.current = signature;
  }, [overrides, children]);

  return <>{children}</>;
}