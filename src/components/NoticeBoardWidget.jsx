export default function NoticeBoardWidget() {
  return (
    <aside
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors"
      role="region"
      aria-labelledby="notice-title"
    >
      <h2 id="notice-title" className="font-semibold text-lg text-slate-800 dark:text-slate-100">
        Notice Board
      </h2>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Share important announcements with all club members.
      </p>

      <button
        className="inline-flex items-center justify-center rounded-xl
        bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-medium
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 dark:focus-visible:ring-indigo-400 transition-colors"
      >
        Post Notice
      </button>
    </aside>
  );
}