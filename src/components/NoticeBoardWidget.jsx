export default function NoticeBoardWidget() {
  return (
    <aside
      className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-4"
      role="region"
      aria-labelledby="notice-title"
    >
      <h2 id="notice-title" className="font-semibold text-lg">
        Notice Board
      </h2>

      <p className="text-sm text-muted-foreground">
        Share important announcements with all club members.
      </p>

      <button
        className="inline-flex items-center justify-center rounded-xl
        bg-primary text-primary-foreground px-4 py-2 text-sm font-medium
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Post Notice
      </button>
    </aside>
  );
}
