import Link from "next/link";
import { SubmitButton } from "@/components/admin/shared/SubmitButton";

export function FormActions({ submitLabel = "Save", cancelHref }: { submitLabel?: string; cancelHref?: string }) {
  return (
    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e8dece] pt-5 sm:flex-row sm:items-center">
      {cancelHref ? (
        <Link
          href={cancelHref}
          className="inline-flex items-center justify-center rounded-xl border border-[#d2c6b1] bg-white px-4 py-2.5 text-sm font-medium text-[#3b5245] transition hover:bg-[#f8f3ea]"
        >
          Cancel
        </Link>
      ) : null}
      <SubmitButton
        pendingText="Saving..."
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#2e5a3d_0%,#1f3f2f_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-18px_rgba(10,20,14,0.9)] transition hover:brightness-110"
      >
        {submitLabel}
      </SubmitButton>
    </div>
  );
}
