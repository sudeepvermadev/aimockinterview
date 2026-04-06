/**
 * Export All Users to a Professionally Styled Excel Sheet
 * 
 * Run:  node scripts/exportUsers.js
 * Output: PrepEdge-Users.xlsx in the project root
 */

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

// ─── Load .env.local ───
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

let privateKey = env.FIREBASE_PRIVATE_KEY || "";
privateKey = privateKey.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "");

// ─── Firebase Admin ───
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}
const db = getFirestore();

// ─── Design Tokens (High-Contrast Branded Light Theme) ───
const COLORS = {
  brandDark: "FFFFFF",      // Pure White Background
  brandCard: "F8FAFF",      // Very Light Blue/Grey for Zebra Striping
  brandAccent: "6366F1",    // Indigo/Purple for Accents (Darker for readability)
  brandText: "000000",      // Black for Primary Text
  brandMuted: "475569",     // Slate for Secondary Text
  headerBg: "F1F5F9",       // Light Slate for Header Area
  headerText: "1E293B",     // Deep Navy for Header Text
  border: "E2E8F0",         // Soft Border
  accentLine: "6366F1",     // Accent Line
};

async function exportUsers() {
  console.log("📦 Fetching data from Firestore...\n");

  const [userSnapshot, reviewSnapshot] = await Promise.all([
    db.collection("users").get(),
    db.collection("reviews").get()
  ]);

  if (userSnapshot.empty) {
    console.log("❌ No users found in the database.");
    return;
  }

  // Group reviews by userId
  const reviewsByUserId = {};
  reviewSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.userId) {
      if (!reviewsByUserId[data.userId]) {
        reviewsByUserId[data.userId] = [];
      }
      reviewsByUserId[data.userId].push({
        rating: data.rating,
        message: data.message,
        date: data.createdAt
      });
    }
  });

  let migratedBaselineCount = 0;
  const users = [];
  userSnapshot.forEach((doc) => {
    const data = doc.data();
    const userReviews = reviewsByUserId[doc.id] || [];
    let reviewsString = userReviews
      .map(r => `[${r.rating}★] ${r.message}`)
      .join(" | ");

    // Explicit check for the migration 'review' field
    if (!reviewsString && data.review) {
      reviewsString = `[${data.review}★] Professional Baseline (Migration)`;
      migratedBaselineCount++;
    }

    users.push({
      id: doc.id,
      name: data.name || "N/A",
      email: data.email || "N/A",
      createdAt: data.createdAt || "N/A",
      reviews: (reviewsString && reviewsString.trim() !== "") ? reviewsString : "No reviews yet"
    });
  });

  console.log(`✅ Processed ${users.length} users.`);
  console.log(`📊 Migration Check: Found ${migratedBaselineCount} users with the baseline 5★ rating.`);
  console.log(`✅ Found ${reviewSnapshot.size} custom review(s) in the database.\n`);

  // ─── Create Workbook ───
  const wb = new ExcelJS.Workbook();
  wb.creator = "PrepEdge";
  wb.created = new Date();

  const ws = wb.addWorksheet("Users", {
    properties: { defaultRowHeight: 24 },
    views: [{ state: "frozen", ySplit: 6 }],
  });

  // ─── Column Definitions ───
  ws.columns = [
    { key: "sr", width: 10 },
    { key: "name", width: 30 },
    { key: "email", width: 40 },
    { key: "date", width: 25 },
    { key: "reviews", width: 60 },
  ];

  // ─── Rows 1-3: Header area (Branded Light) ───
  ws.getRow(1).height = 60;
  ws.getRow(2).height = 22;
  ws.getRow(3).height = 22;

  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 5; c++) {
      const cell = ws.getRow(r).getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.headerBg } };
    }
  }

  // ─── Row 1: Title (A1:E1) ───
  ws.mergeCells("A1:E1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "PrepEdge — Official User Analytics & Database Report";
  titleCell.font = { name: "Segoe UI", size: 20, bold: true, color: { argb: COLORS.brandAccent } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };

  // ─── Row 2: Subtitle (A2:E2) ───
  ws.mergeCells("A2:E2");
  const subtitleCell = ws.getCell("A2");
  subtitleCell.value = "Comprehensive Registrant Engagement and Performance Summary";
  subtitleCell.font = { name: "Segoe UI", size: 11, italic: true, color: { argb: COLORS.brandMuted } };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };

  // ─── Row 3: Date & Info (A3:E3) ───
  ws.mergeCells("A3:E3");
  const infoCell = ws.getCell("A3");
  infoCell.value = `Report Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}  •  Sync Strength: ${users.length} Active Records`;
  infoCell.font = { name: "Segoe UI", size: 9, color: { argb: COLORS.brandMuted } };
  infoCell.alignment = { horizontal: "center", vertical: "middle" };

  // ─── Row 4: Accent Line (Brand Indigo) ───
  ws.getRow(4).height = 6;
  for (let c = 1; c <= 5; c++) {
    const cell = ws.getRow(4).getCell(c);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.accentLine } };
  }

  // ─── Row 5: Spacer ───
  ws.getRow(5).height = 10;

  // ─── Row 6: Column Headers ───
  const headers = ["Index", "Full Name", "Secure Email", "Registry Date", "User Sentiment & Ratings"];
  const headerRow = ws.getRow(6);
  headerRow.height = 36;

  headers.forEach((header, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = header.toUpperCase();
    cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.brandAccent } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      bottom: { style: "thick", color: { argb: "FFFFFF" } },
      right: { style: "thin", color: { argb: "FFFFFF" } }
    };
  });

  // ─── Data Rows ───
  users.forEach((user, index) => {
    const rowNum = index + 7;
    const isEven = index % 2 === 0;
    const bgColor = isEven ? COLORS.brandCard : COLORS.brandDark;

    const row = ws.getRow(rowNum);
    row.height = 30;

    // Sr. No.
    const srCell = row.getCell(1);
    srCell.value = index + 1;
    srCell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: COLORS.brandAccent } };
    srCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    srCell.alignment = { horizontal: "center", vertical: "middle" };

    // Name
    const nameCell = row.getCell(2);
    nameCell.value = user.name;
    nameCell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: COLORS.brandText } };
    nameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    nameCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    // Email
    const emailCell = row.getCell(3);
    emailCell.value = user.email;
    emailCell.font = { name: "Segoe UI", size: 10, color: { argb: COLORS.brandText } };
    emailCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    emailCell.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

    // Date
    const dateCell = row.getCell(4);
    let formattedDate = user.createdAt;
    try {
      const d = new Date(user.createdAt);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });
      }
    } catch { }
    dateCell.value = formattedDate;
    dateCell.font = { name: "Segoe UI", size: 10, color: { argb: COLORS.brandMuted } };
    dateCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    dateCell.alignment = { horizontal: "center", vertical: "middle" };

    // Reviews
    const reviewCell = row.getCell(5);
    reviewCell.value = user.reviews;
    reviewCell.font = { name: "Segoe UI", size: 9, color: { argb: COLORS.brandMuted } };
    reviewCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
    reviewCell.alignment = { horizontal: "left", vertical: "middle", indent: 1, wrapText: true };

    // Borders for all cells
    [srCell, nameCell, emailCell, dateCell, reviewCell].forEach((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: COLORS.border } },
        right: { style: "thin", color: { argb: COLORS.border } },
      };
    });
  });

  // ─── Bottom Summary Row ───
  const summaryRowNum = users.length + 8;
  ws.mergeCells(`A${summaryRowNum}:E${summaryRowNum}`);
  const summaryCell = ws.getCell(`A${summaryRowNum}`);
  summaryCell.value = `PREPEDGE PLATFORM INSIGHT • TOTAL USERS: ${users.length} • SUCCESSFUL EXPORT`;
  summaryCell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FFFFFF" } };
  summaryCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.brandAccent } };
  summaryCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(summaryRowNum).height = 36;

  // ─── Save ───
  const outputPath = path.join(__dirname, "..", "PrepEdge-Users.xlsx");
  await wb.xlsx.writeFile(outputPath);

  console.log(`📊 Styled Excel file saved: ${outputPath}`);
  console.log(`✅ Success: Total records generated with Reviews.`);
}


exportUsers().catch((err) => {
  console.error("❌ Export failed:", err.message);
  process.exit(1);
});
