import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search, ChevronRight } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Members() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [pujaMap, setPujaMap] = useState({});
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newMember, setNewMember] = useState({
    name: "",
    emailPrefix: "",
    password: "",
  });
  /* ================= LOAD MEMBERS + PUJA SUMMARY ================= */
  useEffect(() => {
    if (user?.role !== "admin") return;

    const loadData = async () => {
      try {
        // 1️⃣ Members
        const memberRes = await api.get("/members");
        const memberList = memberRes.data.data || [];
        setMembers(memberList);

        // 2️⃣ Puja summary (🔥 ONE API CALL)
        const pujaRes = await api.get(
          "/puja-contributions/summary"
        );

        const map = {};
        pujaRes.data.data.forEach((p) => {
          map[p.memberId] = {
            total: p.total,
            paid: p.paid,
          };
        });

        setPujaMap(map);
      } catch (err) {
        console.error("Member load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  /* ================= ADD MEMBER ================= */
  const addMember = async () => {
    if (
      !newMember.name ||
      !newMember.emailPrefix ||
      !newMember.password
    ) {
      alert("All fields are required");
      return;
    }

    const payload = {
      name: newMember.name,
      email: `${newMember.emailPrefix}@clubname.com`,
      password: newMember.password,
    };

    try {
      const res = await api.post("/members", payload);
      setMembers((prev) => [...prev, res.data.data]);
      setNewMember({ name: "", emailPrefix: "", password: "" });
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };


  const filteredMembers = members.filter((m) => {
    const name = m.name?.toLowerCase() || "";
    const email = m.email?.toLowerCase() || "";
    return (
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase())
    );
  });

  if (loading) {
    return <p className="text-gray-500">Loading members...</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Members</h2>

        {user?.role === "admin" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <UserPlus size={18} /> Add Member
          </button>
        )}
      </div>

      {/* ADD MEMBER */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow max-w-lg">
          <input
            placeholder="Name"
            className="w-full border rounded-lg px-3 py-2 mb-3"
            value={newMember.name}
            onChange={(e) =>
              setNewMember({ ...newMember, name: e.target.value })
            }
          />
          <label className="text-sm font-medium">Email</label>

          <div className="flex items-center border rounded-lg overflow-hidden mb-3">
            <input
              type="text"
              placeholder="username"
              className="flex-1 px-3 py-2 outline-none"
              value={newMember.emailPrefix}
              onChange={(e) =>
                setNewMember({
                  ...newMember,
                  emailPrefix: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, ""), // only letters & numbers
                })
              }
            />
            <span className="bg-gray-100 px-3 py-2 text-gray-600 text-sm">
              @clubname.com
            </span>
          </div>

          <label className="text-sm font-medium">Password</label>

          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Set member password"
            value={newMember.password}
            onChange={(e) =>
              setNewMember({ ...newMember, password: e.target.value })
            }
          />

          <div className="flex gap-3">
            <button
              onClick={addMember}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-3 max-w-md">
        <Search size={18} className="text-gray-400" />
        <input
          placeholder="Search member"
          className="w-full outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MOBILE VIEW */}
      <div className="space-y-3 sm:hidden">
        {filteredMembers.map((m) => {
          const puja = pujaMap[m._id];
          return (
            <div
              key={m._id}
              onClick={() =>
                navigate(`/dashboard/members/${m._id}`)
              }
              className="bg-white rounded-xl shadow p-4 flex justify-between items-center cursor-pointer"
            >
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-500">
                  {m.email}
                </p>

                <p
                  className={`text-xs mt-1 font-semibold ${
                    puja?.paid
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  Puja:{" "}
                  {puja?.paid
                    ? `Paid ₹${puja.total}`
                    : "Not Paid"}
                </p>
              </div>
              <ChevronRight />
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">
                Puja Contribution
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m) => {
              const puja = pujaMap[m._id];
              return (
                <tr
                  key={m._id}
                  onClick={() =>
                    navigate(
                      `/dashboard/members/${m._id}`
                    )
                  }
                  className="border-t hover:bg-indigo-50 cursor-pointer"
                >
                  <td className="p-3 font-medium">
                    {m.name}
                  </td>
                  <td className="p-3">{m.email}</td>
                  <td className="p-3 capitalize">
                    {m.role}
                  </td>
                  <td className="p-3">
                    {puja?.paid ? (
                      <span className="text-green-600 font-semibold">
                        Paid ₹{puja.total}
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        Not Paid
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
