// Avatar.jsx
import React from "react";

export default function Avatar({ src, name, size = 40 }) {
  return (
    <div className="inline-flex items-center">
      {src ? (
        <img src={src} alt={name || "avatar"} className="rounded-full" style={{ width: size, height: size }} />
      ) : (
        <div className="bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700" style={{ width: size, height: size }}>
          {name ? name[0].toUpperCase() : "U"}
        </div>
      )}
    </div>
  );
}
