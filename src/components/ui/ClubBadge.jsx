export default function ClubBadge({ clubName }) {
  return (
    <div className="mt-3 px-3 py-2 rounded-lg bg-indigo-50/70">
      <div className="text-xs text-gray-500">Active Club</div>
      <div className="text-sm font-medium text-indigo-700 truncate">
        {clubName}
      </div>
    </div>
  );
}
