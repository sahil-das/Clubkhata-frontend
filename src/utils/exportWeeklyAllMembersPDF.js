import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportWeeklyAllMembersPDF({
  clubName = "Saraswati Club",
  members = [],
  cycle = { name: "Current Cycle", totalWeeks: 0, weeklyAmount: 0 },
}) {
  const doc = new jsPDF();
  const totalWeeks = Number(cycle.totalWeeks) || 0;
  const weekAmount = Number(cycle.weeklyAmount) || 0;
  const totalExpectedPerMember = totalWeeks * weekAmount;

  // --- CALCULATE GLOBAL STATS ---
  let globalTotalPaid = 0;
  let globalTotalExpected = members.length * totalExpectedPerMember;
  
  const memberRows = members.map((member) => {
    // Handle different data structures (array of weeks vs payments array)
    const paidWeeksCount = Array.isArray(member.weeks) 
      ? member.weeks.filter((w) => w.paid).length
      : (member.payments?.length || 0);

    const totalPaid = paidWeeksCount * weekAmount;
    const dueAmount = totalExpectedPerMember - totalPaid;
    
    globalTotalPaid += totalPaid;

    return [
      member.name,
      `${paidWeeksCount} / ${totalWeeks}`,
      `₹${totalPaid}`,
      `₹${dueAmount}`,
      dueAmount === 0 ? "Completed" : "Pending"
    ];
  });

  const collectionRate = globalTotalExpected > 0 
    ? ((globalTotalPaid / globalTotalExpected) * 100).toFixed(1) 
    : "0.0";

  let y = 20;

  // ================= TITLE SECTION =================
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(clubName, 14, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Weekly Contribution Report", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Cycle: ${cycle.name} | Generated: ${new Date().toLocaleDateString()}`, 14, y);
  y += 10;

  // ================= SUMMARY CARD =================
  // Draw a light gray box for stats
  doc.setFillColor(245, 245, 245); 
  doc.roundedRect(14, y, 180, 25, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  // Col 1: Total Members
  doc.text("Total Members", 20, y + 8);
  doc.setFontSize(14);
  doc.text(String(members.length), 20, y + 18);
  
  // Col 2: Weeks & Rate
  doc.setFontSize(11);
  doc.text("Total Weeks", 70, y + 8);
  doc.setFontSize(14);
  doc.text(`${totalWeeks} (@ ₹${weekAmount})`, 70, y + 18);

  // Col 3: Collection Status
  doc.setFontSize(11);
  doc.text("Collection Progress", 130, y + 8);
  doc.setFontSize(14);
  
  // Color code the financial status
  if (globalTotalPaid === globalTotalExpected) doc.setTextColor(0, 150, 0); // Green
  else doc.setTextColor(200, 0, 0); // Red (or default black)

  doc.text(`₹${globalTotalPaid} / ₹${globalTotalExpected} (${collectionRate}%)`, 130, y + 18);
  
  y += 35; // Move down after box

  // ================= TABLE 1: MEMBER OVERVIEW =================
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("1. Member Overview", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Member Name", "Progress (Wks)", "Paid", "Due", "Status"]],
    body: memberRows,
    theme: "striped",
    headStyles: { fillColor: [63, 81, 181] }, // Indigo header
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      2: { fontStyle: "bold", textColor: [0, 128, 0] }, // Paid column green
      3: { textColor: [200, 0, 0] } // Due column red
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ================= TABLE 2: DETAILED BREAKDOWN =================
  // Only add if we have space, else new page
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(12);
  doc.text("2. Payment Details per Member", 14, y);
  y += 6;

  members.forEach((member, index) => {
    // Check page break
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Normalize paid data
    let paidWeeksData = [];
    if (Array.isArray(member.weeks)) {
        paidWeeksData = member.weeks.filter(w => w.paid).map(w => ({
            week: w.week,
            date: new Date(w.paidAt).toLocaleDateString()
        }));
    } else if (Array.isArray(member.payments)) {
        paidWeeksData = member.payments.map(p => ({
            week: p.week,
            date: p.date ? new Date(p.date).toLocaleDateString() : "-"
        }));
    }
    
    // Sort by week number
    paidWeeksData.sort((a, b) => a.week - b.week);

    // Section Header for Member
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${member.name}`, 14, y);
    
    const paidCount = paidWeeksData.length;
    const paidAmt = paidCount * weekAmount;
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Paid: ₹${paidAmt}  |  Pending: ₹${totalExpectedPerMember - paidAmt}`, 14, y + 5);
    
    y += 8;

    // Mini Table for weeks
    if (paidWeeksData.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [["Week No.", "Payment Date", "Amount"]],
            body: paidWeeksData.map(p => [
                `Week ${p.week}`, 
                p.date, 
                `₹${weekAmount}`
            ]),
            theme: "grid",
            styles: { fontSize: 8 },
            headStyles: { fillColor: [220, 220, 220], textColor: 50 },
            margin: { left: 14, right: 100 } // Keep table compact width
        });
        y = doc.lastAutoTable.finalY + 10;
    } else {
        doc.setFontSize(9);
        doc.setTextColor(150, 0, 0);
        doc.text("No payments recorded yet.", 14, y + 2);
        y += 10;
    }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: "right" });
  }

  doc.save("Weekly_Contribution_Report.pdf");
}