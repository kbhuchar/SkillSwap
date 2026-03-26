export default function BrowseLoading() {
  return (
    <div className="max-w-6xl mx-auto pb-8 animate-pulse">
      {/* Header */}
      <div className="flex items-end justify-between pb-1 mb-3">
        <div className="space-y-2">
          <div className="h-7 w-24 bg-[#1e1e1e] rounded-lg" />
          <div className="h-4 w-48 bg-[#1a1a1a] rounded-lg" />
        </div>
        <div className="h-8 w-24 bg-[#1a1a1a] rounded-full" />
      </div>

      {/* Filter bar placeholder */}
      <div className="h-12 bg-[#1a1a1a] rounded-xl mb-6" />

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1e1e1e]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-28 bg-[#1e1e1e] rounded" />
                <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
              </div>
            </div>
            <div className="h-3 w-full bg-[#1a1a1a] rounded" />
            <div className="h-3 w-3/4 bg-[#1a1a1a] rounded" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-16 bg-[#1a1a1a] rounded-full" />
              <div className="h-6 w-16 bg-[#1a1a1a] rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
