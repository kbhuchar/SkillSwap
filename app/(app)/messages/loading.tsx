export default function MessagesLoading() {
  return (
    <div className="max-w-xl mx-auto animate-pulse">
      <div className="mb-5 space-y-1.5">
        <div className="h-6 w-24 bg-[#1e1e1e] rounded-lg" />
        <div className="h-3.5 w-44 bg-[#1a1a1a] rounded-lg" />
      </div>

      <div className="space-y-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 px-3 py-3.5">
            <div className="w-12 h-12 rounded-full bg-[#1e1e1e] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-28 bg-[#1e1e1e] rounded" />
                <div className="h-3 w-10 bg-[#1a1a1a] rounded" />
              </div>
              <div className="h-3 w-48 bg-[#1a1a1a] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
