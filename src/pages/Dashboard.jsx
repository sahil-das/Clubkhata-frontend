import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom"; // Ensure this is imported

export default function Dashboard() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        <Navbar setOpen={setOpen} />

        <main className="p-4 md:p-6">
          {/* REPLACE {children} WITH <Outlet /> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}