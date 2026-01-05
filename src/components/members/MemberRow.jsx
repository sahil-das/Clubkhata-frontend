import { MoreVertical } from "lucide-react";

export default function MemberRow({ member }) {
  return (
    <tr className="hover:bg-gray-50 transition">
      {/* Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full
            bg-gradient-to-br from-indigo-500 to-purple-500
            text-white flex items-center justify-center
            text-xs font-semibold">
            {member.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {member.name}
            </p>
            <p className="text-xs text-gray-500">
              {member.email}
            </p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {member.role}
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span
          className={`
            inline-flex px-2 py-1 rounded-full text-xs font-medium
            ${
              member.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-600"
            }
          `}
        >
          {member.status}
        </span>
      </td>

      {/* Joined */}
      <td className="px-6 py-4 text-sm text-gray-500">
        {member.joined}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <button
          className="p-2 rounded-lg hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Member actions"
        >
          <MoreVertical size={18} />
        </button>
      </td>
    </tr>
  );
}
