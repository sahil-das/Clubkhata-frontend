import MemberRow from "./MemberRow";
import MembersEmpty from "./MembersEmpty";

export default function MembersTable({ members }) {
  if (members.length === 0) {
    return <MembersEmpty />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
              Joined
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {members.map(member => (
            <MemberRow key={member.id} member={member} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
