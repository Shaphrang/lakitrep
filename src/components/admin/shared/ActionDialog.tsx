"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ActionDialogProps = {
  success?: string;
  error?: string;
};

export function ActionDialog({ success, error }: ActionDialogProps) {
  const router = useRouter();
  const message = useMemo(() => success || error || "", [success, error]);
  const [open, setOpen] = useState(Boolean(message));

  if (!open || !message) return null;

  const isSuccess = Boolean(success);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#e1d6c8] bg-[#fffdf8] p-5 shadow-2xl">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${isSuccess ? "text-[#2f5a3d]" : "text-rose-700"}`}>
          {isSuccess ? "Success" : "Action failed"}
        </p>
        <p className="mt-2 text-base leading-7 text-[#2a4634]">{message}</p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            router.replace(window.location.pathname + window.location.hash);
            router.refresh();
          }}
          className="mt-5 h-11 w-full rounded-xl bg-[#2f5a3d] text-sm font-semibold text-white shadow-sm transition hover:bg-[#264f35]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
