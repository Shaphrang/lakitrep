"use client";

import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "@/components/admin/shared/LoadingSpinner";

export function ConfirmSubmitButton({
  label,
  confirmMessage,
  pendingLabel = "Deleting...",
  className,
}: {
  label: string;
  confirmMessage: string;
  pendingLabel?: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      aria-disabled={pending}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={`${className} inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {pending ? (
        <>
          <LoadingSpinner />
          {pendingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}
