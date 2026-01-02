import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportFinancialReportPDF({
  year,
  openingBalance,
  incomeSources, // { weekly, puja, donation }
  totalIncome,
  totalExpense,
  netBalance,
}) {
  const doc = new jsPDF();
  let y = 20;

  // ================= HEADER =================
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text("Saraswati Club", 14, y);
  y += 8;

  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text("Annual Financial Report", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Financial Year: ${year}`, 14, y);
  y += 5;
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, y);
  y += 15;

  // ================= SUMMARY CARD =================
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, y, 180, 40, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  // Row 1: Opening & Income
  doc.text("Opening Balance", 20, y + 10);
  doc.setFontSize(14);
  doc.text(`Rs ${openingBalance}`, 20, y + 18);
  
  doc.setFontSize(11);
  doc.text("Total Income", 80, y + 10);
  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129); // Green
  doc.text(`+ Rs ${totalIncome}`, 80, y + 18);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("Total Expenses", 140, y + 10);
  doc.setFontSize(14);
  doc.setTextColor(239, 68, 68); // Red
  doc.text(`- Rs ${totalExpense}`, 140, y + 18);

  // Row 2: Net Balance
  y += 28;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("NET CENTRAL FUND BALANCE", 20, y);
  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text(`Rs ${netBalance}`, 80, y);

  y += 25;

  // ================= DETAILS TABLE =================
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Detailed Breakdown", 14, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [["Category", "Description", "Amount", "Type"]],
    body: [
      ["Opening", "Brought forward from previous year", `Rs ${openingBalance}`, "Asset"],
      ["Income", "Weekly Contributions", `Rs ${incomeSources.weekly}`, "Credit"],
      ["Income", "Puja Contributions", `Rs ${incomeSources.puja}`, "Credit"],
      ["Income", "Donations", `Rs ${incomeSources.donation}`, "Credit"],
      ["Expense", "Approved Expenses", `Rs ${totalExpense}`, "Debit"],
      // Divider
      [{ content: "Closing Balance", colSpan: 2, styles: { fontStyle: 'bold', halign: 'right' } }, { content: `Rs ${netBalance}`, styles: { fontStyle: 'bold', textColor: [0, 128, 0] } }, "-"],
    ],
    theme: "striped",
    headStyles: { fillColor: [63, 81, 181] },
    columnStyles: {
      2: { fontStyle: "bold", halign: "right" },
      3: { halign: "center" }
    }
  });

  // ================= FOOTER =================
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Treasurer Signature", 150, finalY);
  doc.line(150, finalY - 5, 190, finalY - 5);

  doc.save(`Financial_Report_${year}.pdf`);
}