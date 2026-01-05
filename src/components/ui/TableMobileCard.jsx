// TableMobileCard.jsx
import React from "react";
import Badge from "./Badge";

export default function TableMobileCard({ title, fields = [], action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-gray-900">{title}</div>
        {action}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        {fields.map((f, idx) => (
          <React.Fragment key={idx}>
            <div className="text-xs text-gray-400">{f.label}</div>
            <div className="text-right">{f.value}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
