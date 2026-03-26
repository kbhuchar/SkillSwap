export default function MatchesLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="h-5 w-20 bg-[#1e1e1e] rounded-lg" />
        <div className="h-3.5 w-56 bg-[#1a1a1a] rounded-lg" />
      </div>

      {/* Tabs */}
      <div className="h-9 w-48 bg-[#1a1a1a] rounded-xl" />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#141414] border border-[#252525] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1e1e1e]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-[#1e1e1e] rounded" />
                <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-[#1a1a1a] rounded-full" />
              <div className="h-6 w-16 bg-[#1a1a1a] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
