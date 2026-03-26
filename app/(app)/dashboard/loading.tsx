export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto pb-8 space-y-6 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#181818] border border-[#252525] rounded-2xl p-4 h-20" />
        ))}
      </div>

      {/* CTA shimmer */}
      <div className="bg-[#181818] border border-[#252525] rounded-2xl h-14" />

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="md:col-span-3 space-y-5">
          <div className="bg-[#181818] border border-[#252525] rounded-2xl h-48" />
          <div className="bg-[#181818] border border-[#252525] rounded-2xl h-36" />
        </div>
        <div className="md:col-span-2">
          <div className="bg-[#181818] border border-[#252525] rounded-2xl h-48" />
        </div>
      </div>
    </div>
  );
}
