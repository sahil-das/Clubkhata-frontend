export default function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-4 p-4">
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
        {activity.user?.name?.[0] || "U"}
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-medium">{activity.user?.name}</span>{" "}
          {activity.action}
        </p>
        <time
          dateTime={activity.timestamp}
          className="text-xs text-muted-foreground"
        >
          {activity.timeLabel}
        </time>
      </div>
    </div>
  );
}
