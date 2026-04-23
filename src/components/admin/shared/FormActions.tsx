import Link from "next/link";

export function FormActions({ submitLabel = "Save", cancelHref }: { submitLabel?: string; cancelHref?: string }) {
  return (
    <div className="mt-6 flex gap-3">
      <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        {submitLabel}
      </button>
      {cancelHref ? (
        <Link href={cancelHref} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Cancel
        </Link>
      ) : null}
    </div>
  );
}
