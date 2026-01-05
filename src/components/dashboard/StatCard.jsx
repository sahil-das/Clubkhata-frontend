export default function StatCard({ label, value, icon: Icon, accent = "indigo" }) {
  return (
    <div
      className="
        bg-white rounded-xl shadow-sm p-5
        transition-all duration-200 ease-out
        hover:shadow-md hover:-translate-y-0.5
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {value}
          </p>
        </div>

        <div
          className={`
            h-10 w-10 rounded-lg flex items-center justify-center
            bg-${accent}-100 text-${accent}-600
          `}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
