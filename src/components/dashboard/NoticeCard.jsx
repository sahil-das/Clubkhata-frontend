export default function NoticeCard({ title, description }) {
  return (
    <div
      className="
        relative rounded-2xl p-5
        bg-gradient-to-br from-indigo-50 to-indigo-100
        border border-indigo-200
      "
    >
      <h3 className="text-sm font-semibold text-indigo-800">
        {title}
      </h3>

      <p className="mt-1 text-sm text-indigo-700">
        {description}
      </p>

      <button
        className="
          mt-4 inline-flex items-center text-sm font-medium
          text-indigo-700 hover:underline
        "
      >
        View details →
      </button>
    </div>
  );
}
