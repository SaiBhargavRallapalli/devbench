"use client";

import FavoriteButton from "@/components/FavoriteButton";
import VaultSaveButton from "@/components/VaultSaveButton";

/** Standard tool chrome: favorite + vault save. */
export default function ToolPageActions({
  slug,
  getContent,
  getContent2,
  vaultTitle,
  children,
}: {
  slug: string;
  getContent?: () => string;
  getContent2?: () => string;
  vaultTitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FavoriteButton slug={slug} />
      {getContent && (
        <VaultSaveButton
          toolSlug={slug}
          getContent={getContent}
          getContent2={getContent2}
          defaultTitle={vaultTitle}
        />
      )}
      {children}
    </div>
  );
}
