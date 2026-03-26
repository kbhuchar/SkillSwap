export default function SessionsLoading() {
  return (
    <div className="max-w-2xl mx-auto pb-8 space-y-4 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-5 w-20 bg-[#1e1e1e] rounded-lg" />
        <div className="h-3.5 w-48 bg-[#1a1a1a] rounded-lg" />
      </div>

      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-[#1e1e1e] rounded" />
            <div className="h-6 w-20 bg-[#1a1a1a] rounded-full" />
          </div>
          <div className="h-3 w-32 bg-[#1a1a1a] rounded" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1e1e1e]" />
            <div className="h-3 w-24 bg-[#1a1a1a] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
