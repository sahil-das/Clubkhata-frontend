export default function EmptyState({ title, description, actionLabel }) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100
        flex items-center justify-center text-indigo-600 font-semibold">
        +
      </div>

      <h3 className="mt-4 text-sm font-medium text-gray-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

      {actionLabel && (
        <button
          className="mt-4 inline-flex items-center px-4 py-2
            rounded-lg bg-indigo-600 text-white text-sm font-medium
            hover:bg-indigo-700 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
