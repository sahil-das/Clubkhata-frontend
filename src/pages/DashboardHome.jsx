// src/pages/DashboardHome.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";

import ResponsiveGrid from "../components/ResponsiveGrid";
import StatCardPremium from "../components/StatCardPremium";
import NoticeBoardWidget from "../components/NoticeBoardWidget";
import ActivityItem from "../components/ActivityItem";
import { StatSkeleton, ListSkeleton } from "../components/Skeletons";
import useSkeleton from "../hooks/useSkeleton";

export default function DashboardHome() {
  // Use hook-based accessors exported by your contexts
  const { user, activeClub } = useAuth();
  const {
    // adapt to what your FinanceContext provides — using the exported names I saw:
    weeklyTotal,
    pujaTotal,
    donationTotal,
    approvedExpenses,
    openingBalance,
    centralFund,
    loading,
    // If you have a combined `recentActivities` or totals object, replace accordingly.
    // e.g., const { totals, recentActivities } = useFinance();
  } = useFinance();

  // If you prefer a totals object similar to my earlier example, compose it here:
  const totals = {
    collections: weeklyTotal + pujaTotal + donationTotal,
    expenses: approvedExpenses,
    balance: centralFund ?? openingBalance,
  };

  const recentActivities = []; // <-- Replace with actual data from your FinanceContext if present

  const showSkeleton = useSkeleton(loading);

  return (
    <main
      className="p-4 sm:p-6 lg:p-8 space-y-8"
      aria-label="Dashboard"
    >
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user?.name} — {activeClub?.name}
        </p>
      </header>

      {/* Stats */}
      <ResponsiveGrid>
        {showSkeleton ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton primary />
          </>
        ) : (
          <>
            <StatCardPremium
              title="Collections"
              value={totals?.collections}
              variant="neutral"
            />
            <StatCardPremium
              title="Expenses"
              value={totals?.expenses}
              variant="danger"
            />
            <StatCardPremium
              title="Net Balance"
              value={totals?.balance}
              variant="primary"
              primary
            />
          </>
        )}
      </ResponsiveGrid>

      {/* Lower Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notice Board */}
        <NoticeBoardWidget />

        {/* Activity */}
        <div
          className="lg:col-span-2 bg-card rounded-2xl shadow-sm border border-border"
          role="region"
          aria-labelledby="activity-title"
        >
          <header className="px-6 py-4 border-b border-border">
            <h2
              id="activity-title"
              className="font-semibold text-lg"
            >
              Recent Activity
            </h2>
          </header>

          <div className="divide-y divide-border">
            {showSkeleton ? (
              <ListSkeleton rows={4} />
            ) : recentActivities?.length ? (
              recentActivities.map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                No recent activity yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
