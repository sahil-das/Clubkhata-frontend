import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportWeeklyAllMembersPDF({
  clubName,
  members,
  cycle,
}) {
  const doc = new jsPDF();
  let y = 20;

  const totalWeeks = cycle.totalWeeks;
  const weekAmount = cycle.weeklyAmount;

  doc.setFontSize(18);
  doc.text(clubName, 14, y);
  y += 8;

  doc.setFontSize(12);
  doc.text("Weekly Contribution Register", 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.text(`Cycle: ${cycle.name}`, 14, y);
  y += 5;

  doc.text(
    `Total Weeks: ${totalWeeks} | Amount / Week: ₹${weekAmount}`,
    14,
    y
  );
  y += 5;

  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    14,
    y
  );
  y += 10;

  members.forEach((member, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const paidWeeks = member.weeks.filter(w => w.paid);
    const totalPaidAmount = paidWeeks.length * weekAmount;

    doc.setFontSize(11);
    doc.text(
      `${index + 1}. ${member.name} (${member.email})`,
      14,
      y
    );
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Total Weeks", "Paid Weeks", "Amount / Week", "Total Paid"]],
      body: [[
        totalWeeks,
        paidWeeks.length,
        `₹ ${weekAmount}`,
        `₹ ${totalPaidAmount}`,
      ]],
      theme: "grid",
      styles: { fontSize: 9 },
    });

    y = doc.lastAutoTable.finalY + 4;

    autoTable(doc, {
      startY: y,
      head: [["Week", "Paid Date"]],
      body: paidWeeks.length
        ? paidWeeks.map(w => [
            `Week ${w.week}`,
            new Date(w.paidAt).toLocaleDateString(),
          ])
        : [["-", "No payments"]],
      theme: "striped",
      styles: { fontSize: 9 },
    });

    y = doc.lastAutoTable.finalY + 10;
  });

  doc.save("weekly_contribution_register.pdf");
}
