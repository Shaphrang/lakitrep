"use client";

export function InvoicePrintButton() {
  return (
    <button onClick={() => window.print()} className="rounded-xl bg-[#e06f00] px-3 py-2 text-sm font-semibold text-white">
      Print Invoice
    </button>
  );
}
