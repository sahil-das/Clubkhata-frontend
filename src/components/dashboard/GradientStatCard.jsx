export default function GradientStatCard({
  label,
  value,
  icon: Icon,
  gradient,
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-5 text-white
        shadow-lg transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl
        ${gradient}
      `}
    >
      {/* subtle glow */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div className="h-11 w-11 rounded-xl bg-white/20
          flex items-center justify-center">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
