import * as XLSX from "xlsx-js-style";

export const exportTransactionsToExcel = (transactions: any[], userName?: string, isAdmin: boolean = false) => {
  if (!transactions || transactions.length === 0) return;

  const workbook = XLSX.utils.book_new();
  const wsData: any[][] = [];
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  });

  // --- Header Section ---
  const title = isAdmin ? "PrepEdge — Master Payment Analytics & Revenue Report" : "PrepEdge — Personal Transaction History Report";
  wsData.push([{ v: title, t: 's', s: { font: { bold: true, color: { rgb: "6366F1" }, sz: 16 }, alignment: { horizontal: "center" } } }]);
  wsData.push([{ v: "Official Financial Record and Payment Verification Summary", t: 's', s: { font: { italic: true, color: { rgb: "64748B" }, sz: 11 }, alignment: { horizontal: "center" } } }]);
  wsData.push([{ v: `Report Generated: ${reportDate} • Records: ${transactions.length} Transactions`, t: 's', s: { font: { sz: 9, color: { rgb: "94A3B8" } }, alignment: { horizontal: "center" } } }]);
  wsData.push([]); // Spacer

  // --- Column Headers ---
  const headerStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "6366F1" } },
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 10 },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } }
    }
  };

  const headers = ["INDEX", "DATE & TIME", "USER NAME", "TRANSACTION ID", "TYPE", "PLAN/COINS", "AMOUNT", "METHOD", "STATUS"];
  wsData.push(headers.map(h => ({ v: h, s: headerStyle })));

  // --- Data Rows ---
  const cellStyle = { alignment: { horizontal: "left" }, font: { sz: 10 } };
  transactions.forEach((txn, index) => {
    wsData.push([
      { v: index + 1, s: { ...cellStyle, alignment: { horizontal: "center" } } },
      { v: new Date(txn.timestamp).toLocaleString(), s: cellStyle },
      { v: isAdmin ? txn.userName : userName, s: cellStyle },
      { v: txn.transactionId, s: cellStyle },
      { v: txn.type === "recharge" ? "Wallet Top-up" : "Subscription", s: cellStyle },
      { v: txn.type === "recharge" ? `${txn.coinsAdded} Coins` : txn.planType, s: cellStyle },
      { v: `₹${txn.amount}`, s: { ...cellStyle, font: { bold: true } } },
      { v: txn.paymentMethod, s: cellStyle },
      { v: "SUCCESS", s: { ...cellStyle, font: { color: { rgb: "10B981" }, bold: true } } }
    ]);
  });

  // --- Footer Section ---
  wsData.push([]);
  wsData.push([{ v: `PREPEDGE REVENUE INSIGHT • TOTAL TRANSACTIONS: ${transactions.length} • SECURE FINANCIAL EXPORT`, s: { fill: { patternType: "solid", fgColor: { rgb: "6366F1" } }, font: { color: { rgb: "FFFFFF" }, bold: true, sz: 9 }, alignment: { horizontal: "center" } } }]);

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Apply Merges & Widths
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
    { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: 8 } }
  ];
  worksheet["!cols"] = [{ wch: 8 }, { wch: 22 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 10 }];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction Detail");

  if (isAdmin) {
    const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    const summaryData = [
      [{ v: "PREPEDGE FINANCIAL SUMMARY", s: { font: { bold: true, sz: 14, color: { rgb: "6366F1" } } } }],
      [],
      [{ v: "Metric", s: headerStyle }, { v: "Value", s: headerStyle }],
      [{ v: "Total Gross Revenue", s: cellStyle }, { v: `₹${totalRevenue}`, s: { ...cellStyle, font: { bold: true } } }],
      [{ v: "Total Volume", s: cellStyle }, { v: `${transactions.length} Payments`, s: cellStyle }],
      [{ v: "Unique Payees", s: cellStyle }, { v: new Set(transactions.map(t => t.userId)).size, s: cellStyle }]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary Report");
  }

  const fileName = `PrepEdge_Financial_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportUsersToExcel = (users: any[]) => {
  if (!users || users.length === 0) return;

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  });

  const workbook = XLSX.utils.book_new();
  const wsData: any[][] = [];

  // --- Header Section ---
  wsData.push([{ v: "PrepEdge — Official User Analytics & Database Report", t: 's', s: { font: { bold: true, color: { rgb: "6366F1" }, sz: 16 }, alignment: { horizontal: "center" } } }]);
  wsData.push([{ v: "Comprehensive Registrant Engagement and Performance Summary", t: 's', s: { font: { italic: true, color: { rgb: "64748B" }, sz: 11 }, alignment: { horizontal: "center" } } }]);
  wsData.push([{ v: `Report Generated: ${reportDate} • Sync Strength: ${users.length} Active Records`, t: 's', s: { font: { sz: 9, color: { rgb: "94A3B8" } }, alignment: { horizontal: "center" } } }]);
  wsData.push([]); // Spacer

  // --- Column Headers ---
  const headerStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "6366F1" } },
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 10 },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } }
    }
  };

  const headers = ["INDEX", "FULL NAME", "SECURE EMAIL", "REGISTRY DATE", "WALLET & PLAN STATUS", "STREAK", "BADGES", "RATING"];
  wsData.push(headers.map(h => ({ v: h, s: headerStyle })));

  // --- Data Rows ---
  const cellStyle = { alignment: { horizontal: "left" }, font: { sz: 10 } };
  users.forEach((user, index) => {
    wsData.push([
      { v: index + 1, s: { ...cellStyle, alignment: { horizontal: "center" } } },
      { v: user.name || "N/A", s: cellStyle },
      { v: user.email || "N/A", s: cellStyle },
      { v: new Date(user.createdAt).toLocaleDateString(), s: cellStyle },
      { v: `${user.plan || "Free"} (${user.walletBalance || 0} Coins)`, s: cellStyle },
      { v: user.streakCount || 0, s: { ...cellStyle, alignment: { horizontal: "center" } } },
      { v: user.badges?.length || 0, s: { ...cellStyle, alignment: { horizontal: "center" } } },
      { v: user.rating || "No Rating", s: { ...cellStyle, font: { bold: true, color: { rgb: user.rating && user.rating !== "No Rating" ? "F59E0B" : "94A3B8" } }, alignment: { horizontal: "center" } } }
    ]);
  });

  // --- Footer Section ---
  wsData.push([]); // Spacer
  const footerStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "6366F1" } },
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 9 },
    alignment: { horizontal: "center" }
  };
  wsData.push([{ v: `PREPEDGE PLATFORM INSIGHT • TOTAL USERS: ${users.length} • SUCCESSFUL EXPORT`, s: footerStyle }]);

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Apply Merges
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Subtitle
    { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } }, // Meta
    { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: 7 } }, // Footer
  ];

  // Set Widths
  worksheet["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];

  XLSX.utils.book_append_sheet(workbook, worksheet, "User Report");
  const fileName = `PrepEdge_Official_User_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportUserActivityToExcel = (data: any[]) => {
  if (!data || data.length === 0) return;

  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric"
  });

  const workbook = XLSX.utils.book_new();
  const wsData: any[][] = [];

  // --- Header Section ---
  wsData.push([{ v: "PrepEdge — User Activity & Interview Engagement Report", t: 's', s: { font: { bold: true, color: { rgb: "8B5CF6" }, sz: 16 }, alignment: { horizontal: "center" } } }]);
  wsData.push([{ v: "Comprehensive Audit of Candidate Participation and Role-Based Targeting", t: 's', s: { font: { italic: true, color: { rgb: "64748B" }, sz: 11 }, alignment: { horizontal: "center" } } }]);
  wsData.push([{ v: `Report Generated: ${reportDate} • Analysis Strength: ${data.length} User Records`, t: 's', s: { font: { sz: 9, color: { rgb: "94A3B8" } }, alignment: { horizontal: "center" } } }]);
  wsData.push([]); 

  // --- Column Headers ---
  const headerStyle = {
    fill: { patternType: "solid", fgColor: { rgb: "8B5CF6" } },
    font: { color: { rgb: "FFFFFF" }, bold: true, sz: 10 },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
        top: { style: "thin", color: { rgb: "FFFFFF" } },
        bottom: { style: "thin", color: { rgb: "FFFFFF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } }
    }
  };

  const headers = ["INDEX", "USER NAME", "EMAIL ID", "TOTAL SESSIONS", "UNIQUE ROLES", "PRIMARY ROLES TARGETED"];
  wsData.push(headers.map(h => ({ v: h, s: headerStyle })));

  // --- Data Rows ---
  const cellStyle = { alignment: { horizontal: "left", wrapText: true }, font: { sz: 10 } };
  data.forEach((item, index) => {
    wsData.push([
      { v: index + 1, s: { ...cellStyle, alignment: { horizontal: "center" } } },
      { v: item.name || "N/A", s: { ...cellStyle, font: { bold: true } } },
      { v: item.email || "N/A", s: cellStyle },
      { v: item.totalInterviews, s: { ...cellStyle, alignment: { horizontal: "center" }, font: { bold: true, color: { rgb: "8B5CF6" } } } },
      { v: item.uniqueRolesCount, s: { ...cellStyle, alignment: { horizontal: "center" } } },
      { v: item.rolesList || "None", s: cellStyle }
    ]);
  });

  // --- Footer ---
  wsData.push([]);
  wsData.push([{ v: `PREPEDGE ACTIVITY LOG • SECURE OWNER ACCESS ONLY • TOTAL RECORDS: ${data.length}`, s: { fill: { patternType: "solid", fgColor: { rgb: "8B5CF6" } }, font: { color: { rgb: "FFFFFF" }, bold: true, sz: 9 }, alignment: { horizontal: "center" } } }]);

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    { s: { r: wsData.length - 1, c: 0 }, e: { r: wsData.length - 1, c: 5 } },
  ];
  worksheet["!cols"] = [{ wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 60 }];

  XLSX.utils.book_append_sheet(workbook, worksheet, "User Activity");
  const fileName = `PrepEdge_Activity_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
