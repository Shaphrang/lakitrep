export function FormActions({ submitLabel = "Save" }: { submitLabel?: string }) {
  return (
    <div className="mt-6 flex gap-3">
      <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        {submitLabel}
      </button>
      <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
        Cancel
      </button>
    </div>
  );
}
