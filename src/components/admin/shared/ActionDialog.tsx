"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0f1f17]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#e1d6c8] bg-[#fffdf8] shadow-2xl">
        <div
          className={`border-b p-5 ${
            isSuccess
              ? "border-[#d7e4d4] bg-[#eef7ef]"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl ${
              isSuccess
                ? "bg-[#2f5a3d] text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {isSuccess ? "✓" : "!"}
          </div>

          <p
            className={`mt-4 text-xs font-semibold uppercase tracking-[0.16em] ${
              isSuccess ? "text-[#2f5a3d]" : "text-rose-700"
            }`}
          >
            {isSuccess ? "Success" : "Action failed"}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[#2a4634]">
            {isSuccess ? "Action completed" : "Please check this action"}
          </h2>
        </div>

        <div className="p-5">
          <p className="text-sm leading-7 text-[#2a4634]">{message}</p>

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
    </div>
  );
}