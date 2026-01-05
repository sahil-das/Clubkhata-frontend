export default function MembersEmpty() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto h-14 w-14 rounded-full
        bg-indigo-100 text-indigo-600
        flex items-center justify-center font-semibold">
        +
      </div>

      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No members yet
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Add members to start managing your club.
      </p>

      <button
        className="mt-5 inline-flex items-center px-4 py-2
          rounded-lg bg-indigo-600 text-white text-sm font-medium
          hover:bg-indigo-700 transition"
      >
        Add Member
      </button>
    </div>
  );
}
