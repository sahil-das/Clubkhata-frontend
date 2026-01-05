export default function RecordsTable() {
  return (
    <div
      className="
        bg-white dark:bg-gray-900
        rounded-2xl
        border border-gray-200 dark:border-white/10
        shadow-sm overflow-hidden
      "
    >
      <div className="
        px-5 py-4
        border-b border-gray-200 dark:border-white/10
        flex justify-between
      ">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Recent Khata Records
        </h3>

        <button className="text-sm text-indigo-500 hover:text-indigo-400">
          View all
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-white/5 text-gray-500">
          <tr>
            <th className="px-5 py-3 text-left">Member</th>
            <th className="px-5 py-3 text-left">Amount</th>
            <th className="px-5 py-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr className="
            border-t
            hover:bg-gray-50 dark:hover:bg-white/5
            transition
          ">
            <td className="px-5 py-4 text-gray-400">
              No records yet
            </td>
            <td className="px-5 py-4">—</td>
            <td className="px-5 py-4">—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
