export default function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-6 w-32 bg-gray-300 rounded" />
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}
