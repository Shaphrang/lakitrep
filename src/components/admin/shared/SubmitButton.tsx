"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "@/components/admin/shared/LoadingSpinner";

export function SubmitButton({
  children,
  pendingText = "Saving...",
  className = "",
  disabled,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || Boolean(disabled);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      aria-disabled={isDisabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <LoadingSpinner />
          {pendingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
