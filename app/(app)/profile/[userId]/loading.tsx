export default function PublicProfileLoading() {
  return (
    <div className="max-w-lg mx-auto pb-8 animate-pulse">
      <div className="bg-[#111] rounded-3xl border border-[#1f1f1f] overflow-hidden">
        <div className="aspect-[3/4] bg-[#1a1a1a]" />
        <div className="p-5 space-y-3">
          <div className="h-5 w-36 bg-[#252525] rounded" />
          <div className="h-3.5 w-24 bg-[#1e1e1e] rounded" />
          <div className="h-3 w-full bg-[#1e1e1e] rounded" />
          <div className="h-3 w-4/5 bg-[#1e1e1e] rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-7 w-20 bg-[#1e1e1e] rounded-full" />
            <div className="h-7 w-20 bg-[#1e1e1e] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
