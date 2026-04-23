export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cabd9f] bg-[linear-gradient(135deg,#fbf8f2_0%,#f4ede0_100%)] p-10 text-center shadow-sm">
      <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#6f7f72]">La Ki Trep Admin</p>
      <h3 className="mt-2 font-serif text-2xl text-[#224432]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-[#59695f]">{description}</p>
    </div>
  );
}
