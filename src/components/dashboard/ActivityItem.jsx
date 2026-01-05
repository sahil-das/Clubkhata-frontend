export default function ActivityItem({ title, meta, time }) {
  return (
    <div
      className="
        flex items-start gap-3 py-3
        transition hover:bg-gray-50 rounded-lg px-2
      "
    >
      <div
        className="
          h-9 w-9 rounded-full
          bg-gradient-to-br from-indigo-500 to-purple-500
          text-white flex items-center justify-center
          text-xs font-semibold
        "
      >
        CK
      </div>

      <div className="flex-1">
        <p className="text-sm text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{meta}</p>
      </div>

      <div className="text-xs text-gray-400 whitespace-nowrap">
        {time}
      </div>
    </div>
  );
}
