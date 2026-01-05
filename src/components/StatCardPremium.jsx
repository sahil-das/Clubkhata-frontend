export default function StatCardPremium({
  title,
  value,
  variant = "neutral",
  primary = false,
}) {
  const variants = {
    neutral: "bg-card",
    danger: "bg-card",
    primary:
      "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
  };

  return (
    <div
      className={`rounded-2xl border border-border shadow-sm p-6 transition
        ${variants[variant]}
        ${primary ? "ring-1 ring-primary/30" : ""}
      `}
      role="status"
      aria-label={`${title} statistic`}
    >
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">
        ₹ {value ?? "0"}
      </p>
    </div>
  );
}
