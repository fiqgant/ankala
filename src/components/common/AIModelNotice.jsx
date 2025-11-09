import React, { useEffect, useState } from "react";

const isBrowser = typeof window !== "undefined";

function AIModelNotice({
  storageKey = "ai-model-warning",
  active = true,
  title = "Model masih dalam pelatihan",
  description = "Model AI kami masih terus dilatih sehingga detail lokasi, penamaan tempat, ataupun estimasi biaya bisa kurang tepat. Jadikan hasil ini sebagai referensi awal dan verifikasi kembali sebelum membuat keputusan.",
  ctaLabel = "Saya mengerti",
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (!isBrowser) return;
    if (sessionStorage.getItem(storageKey)) return;
    setOpen(true);
  }, [active, storageKey]);

  const handleClose = () => {
    if (isBrowser) {
      sessionStorage.setItem(storageKey, "ack");
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-model-notice-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2a4634]">
          Pengingat
        </p>
        <h3
          id="ai-model-notice-title"
          className="mt-3 text-2xl font-bold text-gray-900"
        >
          {title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {description}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-400">
            Terima kasih atas pengertiannya 🙏
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl bg-[#1e3124] px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#2a4634] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2a4634]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIModelNotice;
