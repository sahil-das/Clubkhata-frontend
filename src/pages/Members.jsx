import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, MoreVertical, Phone, Mail, 
  Shield, Trash2, UserCog, FileDown, LayoutGrid, List as ListIcon 
} from "lucide-react";

// Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import AddMemberModal from "../components/AddMemberModal"; 
import SubscriptionModal from "../components/SubscriptionModal";
import { exportMembersPDF } from "../utils/pdfExport";

export default function Members() {
  const navigate = useNavigate();
  const { activeClub, user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // For mobile dropdowns

  // --- Fetch Data ---
  const fetchMembers = async () => {
    try {
      const res = await api.get("/members");
      setMembers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // Default to grid on mobile, list on desktop
    if (window.innerWidth < 768) setViewMode("grid");
  }, []);

  // --- Actions ---
  const toggleRole = async (memberId, currentRole) => {
    const newRole = currentRole === "admin" ? "member" : "admin";
    if (!window.confirm(`Change role to ${newRole}?`)) return;

    try {
      await api.put(`/members/${memberId}/role`, { role: newRole });
      setMembers(members.map(m => m.membershipId === memberId ? { ...m, role: newRole } : m));
      setActiveMenu(null);
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Permanently remove this member?")) return;
    try {
      await api.delete(`/members/${id}`);
      setMembers(members.filter(m => m.membershipId !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phone?.includes(searchTerm)
  );

  const isAdmin = activeClub?.role === "admin";

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Club Members</h1>
          <p className="text-slate-500 text-sm">{members.length} Active Members</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* View Toggle (Desktop Only mostly) */}
          <div className="hidden md:flex bg-white border border-slate-200 rounded-lg p-1">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ListIcon size={18} />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          {isAdmin && (
            <>
              <Button 
                variant="secondary" 
                leftIcon={<FileDown size={18} />}
                onClick={() => exportMembersPDF({ clubName: activeClub?.clubName, members })}
              >
                Export
              </Button>
              <Button 
                leftIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
              >
                Add Member
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <Card noPadding className="flex items-center px-4 py-2">
        <Search className="text-slate-400 mr-3" size={20} />
        <input 
          type="text" 
          placeholder="Search by name, phone or email..." 
          className="flex-1 bg-transparent outline-none py-2 text-sm text-slate-700 placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* 3. MEMBER LIST (TABLE VIEW) */}
      {viewMode === "list" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.membershipId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 group-hover:text-primary-600 transition-colors cursor-pointer" onClick={() => navigate(`/members/${member.membershipId}`)}>
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {member.phone || <span className="text-slate-300 italic">No Phone</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                      member.role === 'admin' 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => setSelectedMemberId(member.membershipId)}
                            className="text-xs font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition"
                         >
                            Manage
                         </button>
                         {member.userId !== user?.id && (
                             <button 
                                onClick={() => handleDelete(member.membershipId)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                             >
                                <Trash2 size={16} />
                             </button>
                         )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. GRID VIEW (Mobile / Toggle) */}
      {(viewMode === "grid" || window.innerWidth < 768) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.membershipId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group">
              
              {/* Role Badge */}
              {member.role === 'admin' && (
                <div className="absolute top-4 right-4 text-amber-500 bg-amber-50 p-1.5 rounded-full" title="Admin">
                   <Shield size={14} fill="currentColor" />
                </div>
              )}

              <div className="flex items-center gap-4 mb-4 cursor-pointer" onClick={() => navigate(`/members/${member.membershipId}`)}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 flex items-center justify-center font-bold text-lg shadow-inner">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{member.name}</h3>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                   <Phone size={14} className="text-slate-400" /> 
                   {member.phone || "No phone"}
                </div>
              </div>

              {/* Admin Actions Dropdown (Mobile Friendly) */}
              {isAdmin && (
                 <div className="border-t border-slate-100 pt-3 flex gap-2">
                    <Button 
                        variant="secondary" 
                        className="flex-1 h-9 text-xs"
                        onClick={() => setSelectedMemberId(member.membershipId)}
                    >
                        Collect Fee
                    </Button>

                    {/* Popover Logic for More Actions */}
                    <div className="relative">
                        <button 
                            onClick={() => setActiveMenu(activeMenu === member.membershipId ? null : member.membershipId)}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                            <MoreVertical size={16} />
                        </button>
                        
                        {activeMenu === member.membershipId && (
                            <div className="absolute right-0 bottom-10 w-40 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-10 animate-fade-in-up origin-bottom-right">
                                {member.userId !== user?.id && (
                                    <>
                                        <button 
                                            onClick={() => toggleRole(member.membershipId, member.role)}
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                                        >
                                            <UserCog size={14} /> {member.role === 'admin' ? "Demote" : "Make Admin"}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(member.membershipId)}
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Remove Member
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                 </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- MODALS --- */}
      {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} refresh={fetchMembers} />}
      
      {selectedMemberId && (
        <SubscriptionModal 
          memberId={selectedMemberId} 
          onClose={() => setSelectedMemberId(null)}
          canEdit={isAdmin} 
        />
      )}
    </div>
  );
}