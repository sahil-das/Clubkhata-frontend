import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   1. HISTORY EXPORT (Detailed - For History Page)
   Expects full lists: weekly[], puja[], donations[], expenses[]
   ========================================================= */
export const exportHistoryCyclePDF = ({
  cycle,
  summary,
  weekly,
  puja,
  donations,
  expenses,
}) => {
  const doc = new jsPDF();
  let y = 15;

  // --- HEADER ---
  doc.setFontSize(18);
  doc.text("Saraswati Puja Committee", 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.text(`Financial Report: ${cycle.name}`, 105, y, { align: "center" });
  y += 6;

  doc.setFontSize(10);
  doc.text(
    `Period: ${new Date(cycle.startDate).toLocaleDateString()} - ${new Date(
      cycle.endDate
    ).toLocaleDateString()}`,
    105,
    y,
    { align: "center" }
  );
  y += 10;

  // --- SUMMARY TABLE ---
  autoTable(doc, {
    startY: y,
    head: [["Opening", "Collections", "Expenses", "Closing"]],
    body: [
      [
        rupee(summary.openingBalance),
        rupee(summary.collections),
        rupee(summary.expenses),
        rupee(summary.closingBalance),
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [63, 81, 181] },
    styles: { halign: "center" },
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- WEEKLY DETAILS ---
  if (weekly?.length) {
    doc.text("Weekly Contributions", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Member Name", "Amount"]],
      body: weekly.map((w) => [w.memberName, rupee(w.total)]),
      theme: "striped",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- PUJA DETAILS ---
  if (puja?.length) {
    doc.text("Puja Contributions", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Member Name", "Amount"]],
      body: puja.map((p) => [p.memberName, rupee(p.total)]),
      theme: "striped",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- DONATIONS DETAILS ---
  if (donations?.length) {
    doc.text("Donations", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Donor", "Date", "Amount"]],
      body: donations.map((d) => [d.donorName, d.date, rupee(d.amount)]),
      theme: "striped",
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // --- EXPENSES DETAILS ---
  if (expenses?.length) {
    doc.addPage();
    y = 20;
    doc.text("Expenses Breakdown", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Title", "Date", "Amount"]],
      body: expenses.map((e) => [e.title, e.date, rupee(e.amount)]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] },
    });
  }

  doc.save(`History_${cycle.name.replace(/\s+/g, "_")}.pdf`);
};

/* =========================================================
   2. FINANCE EXPORT (Snapshot - For Reports Page)
   Expects summary[], contributions[], expenses[] (from Reports.jsx)
   ========================================================= */
export const exportFinancePDF = ({
  clubName = "Club",
  summary, // Array: [{label, value}]
  contributions, // Array: [{type, amount}]
  expenses, // Array: [{title, amount, status}]
}) => {
  const doc = new jsPDF();
  let y = 15;

  // --- HEADER ---
  doc.setFontSize(18);
  doc.text(clubName, 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(14);
  doc.text("Current Financial Snapshot", 105, y, { align: "center" });
  y += 15;

  // --- SUMMARY TABLE (From Summary Cards) ---
  doc.text("Summary", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Category", "Amount"]],
    body: summary.map((s) => [s.label, rupee(s.value)]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] }, // Indigo
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- CONTRIBUTIONS BREAKDOWN ---
  doc.text("Contributions Overview", 14, y);
  autoTable(doc, {
    startY: y + 2,
    head: [["Source", "Total Amount"]],
    body: contributions.map((c) => [c.type, rupee(c.amount)]),
    theme: "striped",
  });

  y = doc.lastAutoTable.finalY + 10;

  // --- RECENT EXPENSES ---
  if (expenses?.length) {
    doc.text("Recent Expenses", 14, y);
    autoTable(doc, {
      startY: y + 2,
      head: [["Title", "Status", "Amount"]],
      body: expenses.map((e) => [e.title, e.status, rupee(e.amount)]),
      theme: "striped",
      headStyles: { fillColor: [220, 38, 38] }, // Red
    });
  }

  doc.save("Finance_Report_Snapshot.pdf");
};

// --- UTILS ---
function rupee(n) {
  return `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
}