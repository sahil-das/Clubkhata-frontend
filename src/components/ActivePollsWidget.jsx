import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPolls, getPollResults } from "../api/polls";
import { useAuth } from "../context/AuthContext";
import { Vote, ArrowRight, CheckCircle2, BarChart2, Loader2 } from "lucide-react";

export default function ActivePollsWidget() {
  const { activeClub } = useAuth();
  const navigate = useNavigate();
  const [activePoll, setActivePoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const initWidget = async () => {
      if (!activeClub) return;
      try {
        setLoading(true);
        // 1. Get List
        const res = await getPolls();
        const polls = res.data || [];
        // 2. Find Active
        const current = polls.find(p => new Date(p.expiresAt) > new Date());

        if (current) {
           setActivePoll(current);
           setHasVoted(current.userHasVoted || false);
           // Background fetch to ensure vote status is fresh
           getPollResults(current._id).then(detailRes => {
              if(detailRes.data?.userHasVoted !== undefined) {
                 setHasVoted(detailRes.data.userHasVoted);
              }
           }).catch(e => console.log("Silent poll update failed", e));
        } else {
           setActivePoll(null);
        }
      } catch (err) {
        console.error("Poll Widget Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initWidget();
  }, [activeClub]);

  // Loading State
  if (loading) return <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse mb-6" />;

  // ✅ HIDE WIDGET IF NO ACTIVE POLL
  if (!activePoll) return null;

  // ACTIVE STATE
  return (
    <div 
        onClick={() => navigate("/polls")}
        className="w-full bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6 flex flex-col cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 group shrink-0"
    >
       {/* Background Icon */}
       <div className="absolute -right-6 -bottom-6 text-white/10 pointer-events-none z-0">
          <Vote size={140} className="rotate-12 group-hover:rotate-6 transition-transform duration-500" />
       </div>

       {/* Content */}
       <div className="relative z-10 flex flex-col gap-4">
          
          {/* Badge */}
          <div className="flex items-start">
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                Live Poll
             </span>
          </div>

          {/* Question */}
          <h3 className="font-bold text-lg leading-snug text-white">
             {activePoll.question}
          </h3>

          {/* Status Box */}
          <div className="bg-white/10 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
             {hasVoted ? (
                <div className="flex items-center gap-2 text-green-300 font-medium text-sm">
                    <CheckCircle2 size={16} />
                    <span>You have voted!</span>
                </div>
             ) : (
                <div className="flex items-center gap-3 text-indigo-100 text-sm">
                    <BarChart2 size={20} className="shrink-0" />
                    <p className="leading-tight">
                        Your opinion matters!<br/>
                        <span className="text-white font-bold">Cast your vote now.</span>
                    </p>
                </div>
             )}
          </div>

          {/* Action Button */}
          <div className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 group-hover:bg-indigo-50 transition-colors">
             {hasVoted ? "View Results" : "Vote Now"} <ArrowRight size={16}/>
          </div>
       </div>
    </div>
  );
}