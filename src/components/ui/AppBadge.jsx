export default function AppBadge() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white
        flex items-center justify-center font-semibold shadow-md">
        CK
      </div>
      <div>
        <div className="text-lg font-semibold text-gray-900 leading-tight">
          ClubKhata
        </div>
        <div className="text-xs text-gray-500">
          Club Finance Manager
        </div>
      </div>
    </div>
  );
}
