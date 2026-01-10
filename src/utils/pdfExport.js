import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/* =========================================================
   CONSTANTS & THEME
   ========================================================= */
const COLORS = {
  primary: [79, 70, 229], // Indigo-600
  secondary: [100, 116, 139], // Slate-500
  text: [30, 41, 59], // Slate-800
  lightBg: [248, 250, 252], // Slate-50
  accent: [245, 158, 11], // Amber (Donations)
  danger: [220, 38, 38], // Red (Expenses)
  success: [16, 185, 129], // Emerald (Collections)
};

// 👇 PASTE YOUR LOGO BASE64 STRING HERE
const LOGO_BASE64 = "data:image/jpeg;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"; 

// Helper: Title Case
const toTitleCase = (str) => {
  return String(str || "")
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const sanitizeName = (s) => String(s || "").trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");

function formatCurrency(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
}

/* ---------------------------------------------------------
   MODERN HEADER COMPONENT
   --------------------------------------------------------- */
const drawHeader = (doc, clubName, reportTitle, subtitle = "") => {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 14;
  
  // 1. Top Decorative Line
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 4, "F");

  // --- LOGO & BRAND SECTION (TOP RIGHT) ---
  const logoSize = 12; 
  const logoY = 10; 
  const logoX = pageWidth - margin - 20; 
  const centerX = logoX + (logoSize / 2); 

  if (LOGO_BASE64) {
      try {
        doc.addImage(LOGO_BASE64, "PNG", logoX, logoY, logoSize, logoSize);
      } catch (e) {
        console.error("Logo Error", e);
      }
  } else {
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(logoX, logoY, logoSize, logoSize, 2.5, 2.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("CK", centerX, logoY + 7.5, { align: "center" });
  }

  // --- BRAND NAME ---
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14); 
  doc.setFont("helvetica", "bold");
  doc.text("ClubKhata", centerX, logoY + logoSize + 6, { align: "center" });

  // --- REPORT TITLES ---
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.text(toTitleCase(clubName || "Club Committee"), margin, 20);

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle.toUpperCase(), margin, 28);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.secondary);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, margin, 35);
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, 42, pageWidth - margin, 42);

  return 50; 
};

const drawFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.secondary);
    doc.text(`Generated by ClubKhata • ${new Date().toLocaleDateString()}`, 14, pageHeight - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: "right" });
  }
};

/* =========================================================
   1. HISTORY EXPORT (FIXED: Footer only on last page)
   ========================================================= */
export const exportHistoryCyclePDF = ({
  cycle,
  summary,
  weekly,
  puja,
  donations,
  expenses,
  clubName,
  frequency = "weekly",
}) => {
  const doc = new jsPDF();
  const margin = 14;
  
  const cycleDate = `${new Date(cycle.startDate).toLocaleDateString('en-IN')} - ${new Date(cycle.endDate).toLocaleDateString('en-IN')}`;
  let y = drawHeader(doc, clubName, "Financial History Report", `Cycle: ${cycle.name} | ${cycleDate}`);

  // --- SUMMARY TABLE ---
  autoTable(doc, {
    startY: y,
    head: [["Opening", "Collections", "Expenses", "Closing"]],
    body: [[
      formatCurrency(summary.openingBalance),
      formatCurrency(summary.collections),
      formatCurrency(summary.expenses),
      formatCurrency(summary.closingBalance),
    ]],
    theme: "grid",
    headStyles: { fillColor: COLORS.primary, halign: 'center', fontStyle: 'bold' },
    bodyStyles: { halign: 'center', fontStyle: 'bold', textColor: COLORS.text, minCellHeight: 12, valign: 'middle' },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 20; 

  // --- SECTIONS HELPER ---
  const addSection = (title, head, body, color, totalValue) => {
    if (y + 35 > 280) { 
      doc.addPage(); 
      y = 20; 
    }

    doc.setFontSize(12);
    doc.setTextColor(...COLORS.text);
    doc.setFont(undefined, "bold");
    
    doc.text(title, margin, y + 4); 
    
    // Footer Logic
    const footRow = ["Total"];
    for (let i = 1; i < head.length - 1; i++) footRow.push("");
    footRow.push(formatCurrency(totalValue));

    autoTable(doc, {
      startY: y + 8,
      head: [head],
      body: body,
      foot: [footRow],
      // ✅ FIX: Only show footer on the last page of the table
      showFoot: 'lastPage',
      theme: "striped",
      headStyles: { fillColor: color },
      footStyles: { fillColor: [241, 245, 249], textColor: COLORS.text, fontStyle: 'bold', halign: 'right' },
      columnStyles: { 
          [head.length - 1]: { halign: "right", fontStyle: "bold" },
          0: { halign: 'left' }
      },
      didParseCell: function(data) {
          if (data.section === 'foot' && data.column.index === 0) {
              data.cell.styles.halign = 'left';
          }
      },
      margin: { left: margin, right: margin }
    });
    
    y = doc.lastAutoTable.finalY + 15;
  };

  if (weekly?.length) {
    const totalWeekly = weekly.reduce((sum, w) => sum + (Number(w.total) || 0), 0);
    const subLabel = frequency === "monthly" ? "Monthly Contributions" : "Weekly Contributions";
    addSection(subLabel, ["Member Name", "Amount"], weekly.map(w => [w.memberName, formatCurrency(w.total)]), COLORS.primary, totalWeekly);
  }

  if (puja?.length) {
    const totalPuja = puja.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
    addSection("Puja Contributions", ["Member Name", "Amount"], puja.map(p => [p.memberName, formatCurrency(p.total)]), COLORS.success, totalPuja);
  }

  if (donations?.length) {
    const totalDonations = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    addSection("Donations", ["Donor", "Date", "Amount"], donations.map(d => [d.donorName, new Date(d.date).toLocaleDateString('en-IN'), formatCurrency(d.amount)]), COLORS.accent, totalDonations);
  }

  if (expenses?.length) {
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    addSection("Expenses Breakdown", ["Title", "Date", "Amount"], expenses.map(e => [e.title, new Date(e.date).toLocaleDateString('en-IN'), formatCurrency(e.amount)]), COLORS.danger, totalExpenses);
  }

  drawFooter(doc);
  doc.save(`${sanitizeName(clubName)}_Archive_${sanitizeName(cycle.name)}.pdf`);
};

/* =========================================================
   2. FINANCE EXPORT
   ========================================================= */
export const exportFinancePDF = ({
  clubName = "Club",
  summary,
  contributions,
  expenses,
}) => {
  const doc = new jsPDF();
  let y = drawHeader(doc, clubName, "Financial Snapshot", "Current Status Overview");

  doc.setFontSize(11); doc.setTextColor(...COLORS.secondary); doc.text("SUMMARY", 14, y);
  autoTable(doc, {
    startY: y + 3,
    head: [["Category", "Amount"]],
    body: summary.map((s) => [s.label, formatCurrency(s.value)]),
    theme: "grid",
    headStyles: { fillColor: COLORS.primary },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } }
  });

  y = doc.lastAutoTable.finalY + 15;

  const totalContributions = contributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  doc.text("CONTRIBUTIONS BREAKDOWN", 14, y);
  autoTable(doc, {
    startY: y + 3,
    head: [["Source", "Total Amount"]],
    body: contributions.map((c) => [c.type, formatCurrency(c.amount)]),
    foot: [["Total", formatCurrency(totalContributions)]],
    showFoot: 'lastPage', // ✅ FIX
    theme: "striped",
    headStyles: { fillColor: COLORS.success },
    footStyles: { fillColor: [241, 245, 249], textColor: COLORS.text, fontStyle: 'bold' },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } }
  });

  y = doc.lastAutoTable.finalY + 15;

  if (expenses?.length) {
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    doc.text("RECENT EXPENSES", 14, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Title", "Status", "Amount"]],
      body: expenses.map((e) => [e.title, e.status.toUpperCase(), formatCurrency(e.amount)]),
      foot: [["Total", "", formatCurrency(totalExpenses)]],
      showFoot: 'lastPage', // ✅ FIX
      theme: "striped",
      headStyles: { fillColor: COLORS.danger },
      footStyles: { fillColor: [241, 245, 249], textColor: COLORS.text, fontStyle: 'bold' },
      columnStyles: { 2: { halign: "right", fontStyle: "bold" } }
    });
  }

  drawFooter(doc);
  doc.save(`${sanitizeName(clubName)}_Finance_Snapshot.pdf`);
};

/* =========================================================
   3. DONATIONS EXPORT
   ========================================================= */
export const exportDonationsPDF = ({ clubName, cycleName, donations = [] }) => {
  const doc = new jsPDF();
  const total = (donations || []).reduce((s, d) => s + Number(d.amount || 0), 0);
  
  let y = drawHeader(doc, clubName, "Donation Report", `Cycle: ${cycleName || "N/A"}`);

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.accent);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Collected: ${formatCurrency(total)}`, doc.internal.pageSize.width - 14, 35, { align: "right" });

  autoTable(doc, {
    startY: y,
    head: [["Date", "Receipt No", "Donor Name", "Contact", "Amount"]],
    body: donations.map((d) => [
      new Date(d.date).toLocaleDateString('en-IN'),
      d.receiptNo || "-",
      d.donorName || "-",
      d.phone || d.address || "-",
      formatCurrency(d.amount),
    ]),
    foot: [["Total", "", "", "", formatCurrency(total)]],
    showFoot: 'lastPage', // ✅ FIX
    theme: "striped",
    headStyles: { fillColor: COLORS.accent },
    footStyles: { fillColor: [241, 245, 249], textColor: COLORS.text, fontStyle: 'bold' },
    columnStyles: { 4: { halign: "right", fontStyle: "bold" } },
  });

  drawFooter(doc);
  doc.save(`${sanitizeName(clubName)}_Donations.pdf`);
};

/* =========================================================
   4. EXPENSES EXPORT
   ========================================================= */
export const exportExpensesPDF = ({ clubName, cycleName, expenses }) => {
  const doc = new jsPDF();
  const totalApproved = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  let y = drawHeader(doc, clubName, "Expenses Report", `Cycle: ${cycleName || "N/A"}`);

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.danger);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Approved: ${formatCurrency(totalApproved)}`, doc.internal.pageSize.width - 14, 35, { align: "right" });

  autoTable(doc, {
    startY: y,
    head: [["Date", "Title", "Category", "Recorded By", "Status", "Amount"]],
    body: expenses.map((e) => [
      new Date(e.date).toLocaleDateString('en-IN'),
      e.title,
      e.category,
      e.recordedBy?.name || "-",
      e.status.toUpperCase(),
      formatCurrency(e.amount),
    ]),
    foot: [["Total", "", "", "", "", formatCurrency(totalApproved)]],
    showFoot: 'lastPage', // ✅ FIX
    theme: "striped",
    headStyles: { fillColor: COLORS.danger },
    footStyles: { fillColor: [241, 245, 249], textColor: COLORS.text, fontStyle: 'bold' },
    columnStyles: { 
        5: { halign: "right", fontStyle: "bold" },
        4: { fontSize: 8, fontStyle: "bold" }
    },
    didParseCell: function(data) {
        if (data.column.index === 4 && data.section === 'body') {
            const status = data.cell.raw;
            if (status === 'APPROVED') data.cell.styles.textColor = [22, 163, 74]; 
            else if (status === 'REJECTED') data.cell.styles.textColor = [220, 38, 38];
            else data.cell.styles.textColor = [217, 119, 6]; 
        }
    }
  });

  drawFooter(doc);
  doc.save(`${sanitizeName(clubName)}_Expenses.pdf`);
};

/* =========================================================
   5. PUJA EXPORT
   ========================================================= */
export const exportPujaPDF = ({ clubName, cycleName, data }) => {
  const doc = new jsPDF();
  const total = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  let y = drawHeader(doc, clubName, "Festival Chanda Report", `Cycle: ${cycleName || "N/A"}`);

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.success);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Collected: ${formatCurrency(total)}`, doc.internal.pageSize.width - 14, 35, { align: "right" });

  autoTable(doc, {
    startY: y,
    head: [["Date", "Member Name", "Notes", "Amount"]],
    body: data.map((row) => [
      new Date(row.createdAt).toLocaleDateString('en-IN'),
      row.user?.name || "Unknown",
      row.notes || "-",
      formatCurrency(row.amount),
    ]),
    foot: [["Total", "", "", formatCurrency(total)]],
    showFoot: 'lastPage', // ✅ FIX
    theme: "striped",
    headStyles: { fillColor: COLORS.success },
    footStyles: { fillColor: [241, 245, 249], textColor: COLORS.text, fontStyle: 'bold' },
    columnStyles: { 3: { halign: "right", fontStyle: "bold" } },
  });

  drawFooter(doc);
  doc.save(`${sanitizeName(clubName)}_Puja_Chanda.pdf`);
};

/* =========================================================
   6. MEMBERS EXPORT
   ========================================================= */
export const exportMembersPDF = ({ clubName, members }) => {
  const doc = new jsPDF();
  
  let y = drawHeader(doc, clubName, "Member Directory", `Total Members: ${members.length}`);

  autoTable(doc, {
    startY: y,
    head: [["#", "Name", "Role", "Phone", "Email", "Joined"]],
    body: members.map((m, index) => [
      index + 1,
      m.name,
      m.role.toUpperCase(),
      m.phone || "-",
      m.email,
      new Date(m.joinedAt).toLocaleDateString('en-IN')
    ]),
    theme: "striped",
    headStyles: { fillColor: COLORS.primary },
    columnStyles: { 
      0: { halign: "center", fontStyle: "bold", cellWidth: 10 },
      2: { fontStyle: "bold", fontSize: 8 },
    },
  });

  drawFooter(doc);
  doc.save(`${sanitizeName(clubName)}_Members_List.pdf`);
};

/* =========================================================
   7. AUDIT LOGS EXPORT
   ========================================================= */
export const exportAuditLogsPDF = ({ clubName, logs, period }) => {
  const doc = new jsPDF();
  
  let y = drawHeader(doc, clubName, "Audit Logs", period ? `Period: ${period}` : "");

  autoTable(doc, {
    startY: y,
    head: [["Date", "Time", "Actor", "Action", "Target", "Details"]],
    body: logs.map((log) => {
        let detailsStr = "-";
        if (log.details) {
             detailsStr = Object.entries(log.details)
                .filter(([k]) => !['_id', 'club', 'userId', 'memberId', 'expenseId'].includes(k))
                .map(([k, v]) => {
                    const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return `${label}: ${v}`;
                })
                .join('\n');
        }

        return [
          new Date(log.createdAt).toLocaleDateString('en-IN'),
          new Date(log.createdAt).toLocaleTimeString(),
          log.actor?.name || "System",
          log.action?.replace(/_/g, ' ') || "-",
          log.target || "-",
          detailsStr
        ];
    }),
    theme: "grid",
    headStyles: { fillColor: COLORS.secondary }, 
    styles: { fontSize: 8, cellPadding: 2, valign: 'middle' },
    columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 18 },
        2: { cellWidth: 25, fontStyle: "bold" },
        5: { fontSize: 7 }
    }
  });

  drawFooter(doc);
  doc.save(`${sanitizeName(clubName)}_AuditLogs.pdf`);
};