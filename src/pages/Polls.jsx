import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  BarChart2, Plus, Vote, Clock, Trash2, CheckCircle2, Eye, EyeOff, X, User
} from "lucide-react";
import CreatePollModal from "../components/CreatePollModal";
import ConfirmModal from "../components/ui/ConfirmModal"; 
import { getPolls, castVote, deletePoll } from "../api/polls"; 
import SkeletonCard from "../loading/SkeletonCard";

export default function Polls() {
  const { activeClub } = useAuth();
  const toast = useToast();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("active");
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });
  
  // ✅ New State for viewing voters
  const [viewingVoters, setViewingVoters] = useState(null); // { title: "Option A", voters: [...] }

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await getPolls(); 
      setPolls(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClub) fetchPolls();
  }, [activeClub]);

  const handleDelete = async () => {
    try {
        await deletePoll(confirmDelete.id);
        toast.success("Poll deleted");
        setPolls(prev => prev.filter(p => p._id !== confirmDelete.id));
    } catch (err) {
        toast.error("Failed to delete poll");
    } finally {
        setConfirmDelete({ isOpen: false, id: null });
    }
  };

  const filteredPolls = polls.filter(p => {
    const isExpired = new Date(p.expiresAt) < new Date();
    return filter === "active" ? !isExpired : isExpired;
  });

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Vote className="text-indigo-600 dark:text-indigo-400" size={32} /> Community Polls
                </h1>
                <p className="text-slate-500 text-sm mt-1">Make your voice count.</p>
            </div>
            {activeClub?.role === 'admin' && (
                <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
                    <Plus size={20} /> Create Poll
                </button>
            )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-fit">
            {["active", "past"].map((t) => (
                <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === t ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                    {t} Polls
                </button>
            ))}
        </div>

        {/* Polls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? [1, 2, 3].map(i => <SkeletonCard key={i} />) : filteredPolls.map((poll) => (
                <PollCard 
                    key={poll._id} 
                    poll={poll} 
                    isAdmin={activeClub?.role === 'admin'} 
                    onDelete={() => setConfirmDelete({ isOpen: true, id: poll._id })} 
                    onVoteSuccess={fetchPolls}
                    onViewVoters={(optionText, voters) => setViewingVoters({ title: optionText, voters })} // 👈 Handle click
                />
            ))}
             {filteredPolls.length === 0 && !loading && (
                <div className="col-span-full py-20 flex flex-col items-center text-slate-400">
                    <BarChart2 size={48} className="opacity-20 mb-4" />
                    <p>No {filter} polls found.</p>
                </div>
            )}
        </div>

        {/* Modals */}
        {showModal && <CreatePollModal onClose={() => setShowModal(false)} refresh={fetchPolls} />}
        
        <ConfirmModal isOpen={confirmDelete.isOpen} onClose={() => setConfirmDelete({ isOpen: false, id: null })} onConfirm={handleDelete} title="Delete Poll?" message="This cannot be undone." isDangerous={true} />

        {/* ✅ VOTER LIST MODAL (For Mobile/Desktop) */}
        {viewingVoters && (
            <VoterListModal 
                title={viewingVoters.title} 
                voters={viewingVoters.voters} 
                onClose={() => setViewingVoters(null)} 
            />
        )}
    </div>
  );
}

/* --- POLL CARD COMPONENT --- */
function PollCard({ poll, onVoteSuccess, isAdmin, onDelete, onViewVoters }) {
    const toast = useToast();
    const [voting, setVoting] = useState(false);
    
    const totalVotes = poll.results?.reduce((acc, r) => acc + r.count, 0) || 0;
    const isExpired = new Date(poll.expiresAt) < new Date();
    const hasVoted = poll.userHasVoted;
    const canVote = !hasVoted && !isExpired;
    const daysLeft = Math.ceil((new Date(poll.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));

    const handleVote = async (optionId) => {
        setVoting(true);
        try {
            await castVote({ pollId: poll._id, selectedOptionIds: [optionId] });
            toast.success("Vote cast successfully!");
            onVoteSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to vote");
        } finally {
            setVoting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative group">
            {isAdmin && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Trash2 size={16} />
                </button>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full flex items-center gap-1 ${isExpired ? "bg-slate-100 text-slate-500" : "bg-emerald-100 text-emerald-700"}`}>
                    <Clock size={10} /> {isExpired ? "Ended" : `${daysLeft} days left`}
                </span>
                <div className="flex items-center gap-1.5">
                    {poll.isAnonymous ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <EyeOff size={10}/> Anon
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                            <Eye size={10}/> Public
                        </span>
                    )}
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight mb-6">{poll.question}</h3>

            <div className="flex-1 space-y-4">
                {poll.options.map((opt) => {
                    const result = poll.results?.find(r => r.optionId === opt.id);
                    const count = result?.count || 0;
                    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isMyVote = poll.userVotes?.includes(opt.id);

                    return (
                        <div key={opt.id} className="relative group/opt">
                            {canVote ? (
                                <button onClick={() => handleVote(opt.id)} disabled={voting} className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all active:scale-[0.98]">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{opt.text}</span>
                                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 flex items-center justify-center"></div>
                                    </div>
                                </button>
                            ) : (
                                <div>
                                    {/* Result Bar */}
                                    <div className={`relative w-full rounded-xl overflow-hidden ${isMyVote ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}>
                                        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800/50" />
                                        <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${isMyVote ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-200 dark:bg-slate-700'}`} style={{ width: `${percent}%` }} />
                                        
                                        <div className="relative p-3 flex justify-between items-center z-10">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {isMyVote && <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                                                <span className={`text-sm font-medium truncate ${isMyVote ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.text}</span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="block text-sm font-bold text-slate-900 dark:text-white">{percent}%</span>
                                                <span className="text-[10px] text-slate-500">{count} votes</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ✅ SHOW VOTERS (Clickable on Mobile) */}
                                    {result.voters && result.voters.length > 0 && (
                                        <div 
                                            onClick={() => onViewVoters(opt.text, result.voters)} // 👈 Open Modal
                                            className="mt-1.5 flex -space-x-1.5 px-1 items-center cursor-pointer hover:opacity-80 active:scale-95 transition-all w-fit"
                                            title="Click to view voters"
                                        >
                                            {result.voters.slice(0, 5).map((v, i) => (
                                                <div key={i} className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center text-[9px] font-bold text-indigo-700 dark:text-indigo-300 uppercase select-none shadow-sm">
                                                    {v.name.charAt(0)}
                                                </div>
                                            ))}
                                            {result.voters.length > 5 && (
                                                <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-sm">
                                                    +{result.voters.length - 5}
                                                </div>
                                            )}
                                            <span className="ml-3 text-[10px] text-slate-400 font-medium">See all</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* --- ✅ VOTER LIST MODAL --- */
function VoterListModal({ title, voters, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Voters for "{title}"</h3>
                        <p className="text-xs text-slate-500">{voters.length} people voted</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors">
                        <X size={20}/>
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-2">
                    {voters.map((v, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                                {v.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                                {v.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}