// @ts-ignore: ESM default export interop
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { google } from "googleapis";

// Load env variables
dotenv.config();

// Derive dirname for robust path handling in ESM & CJS
let _dirname = process.cwd();
try {
  if (typeof import.meta !== "undefined" && import.meta.url) {
    _dirname = path.dirname(fileURLToPath(import.meta.url));
  }
} catch (e) {
  // fallback to cwd
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Persistent JSON file path
const DATA_DIR = path.join(_dirname, "src", "data");
const DATA_FILE = path.join(DATA_DIR, "family_data.json");

// Ensure the data directory exists
if (!process.env.VERCEL && !fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn("Could not create data directory", e);
  }
}

// Google Sheets configuration
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (GOOGLE_PRIVATE_KEY && GOOGLE_PRIVATE_KEY.startsWith('"') && GOOGLE_PRIVATE_KEY.endsWith('"')) {
  GOOGLE_PRIVATE_KEY = GOOGLE_PRIVATE_KEY.slice(1, -1);
}
const GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

let sheets: any = null;
if (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY) {
  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  sheets = google.sheets({ version: "v4", auth });
  console.log("Google Sheets API initialized");
} else {
  console.warn("WARNING: Google Sheets credentials not fully set in .env. Falling back to local JSON.");
}

// Initial imports (we'll fetch initial collections statically if data doesn't exist)
import { 
  initialMembers, 
  initialBranches, 
  initialEvents, 
  initialFundTransactions, 
  initialScholarships, 
  initialDocuments, 
  initialAlbums 
} from "./src/initialData";

// Convert tabular sheet data back to JSON objects
function parseFromSheet(rows: any[]) {
  if (!rows || rows.length <= 1) return [];
  const keys = rows[0];
  const items = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const item: any = {};
    for (let j = 0; j < keys.length; j++) {
      let val = row[j];
      if (val === "" || val === undefined) continue;
      // parse JSON arrays/objects
      if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
        try { val = JSON.parse(val); } catch(e) {}
      }
      // If it's a number string that was forced to text with a leading quote, remove it
      if (typeof val === "string" && val.startsWith("'0")) {
        val = val.substring(1);
      }
      item[keys[j]] = val;
    }
    items.push(item);
  }
  return items;
}

// Convert JSON objects to tabular sheet data
function flattenToSheet(items: any[]) {
  if (!items || items.length === 0) return [[]];
  const keys = Array.from(new Set(items.flatMap(item => Object.keys(item))));
  const rows = [keys];
  for (const item of items) {
    const row = keys.map(k => {
      const val = item[k];
      if (val === undefined || val === null) return "";
      if (typeof val === "object") return JSON.stringify(val);
      if (typeof val === "string" && val.startsWith("0") && val.length > 1 && !isNaN(Number(val))) {
        return "'" + val; // Prevent sheets from trimming leading zeros on phone numbers
      }
      return val;
    });
    rows.push(row);
  }
  return rows;
}

// Helper to load current family database state
async function loadDatabaseState() {
  if (sheets && GOOGLE_SPREADSHEET_ID) {
    try {
      const ranges = ["Members", "Branches", "Events", "FundTransactions", "Scholarships", "Documents", "Albums", "Suggestions", "Logs"];
      const response = await sheets.spreadsheets.values.batchGet({
        spreadsheetId: GOOGLE_SPREADSHEET_ID,
        ranges: ranges,
        valueRenderOption: "UNFORMATTED_VALUE"
      });
      
      const valueRanges = response.data.valueRanges;
      if (valueRanges && valueRanges[0].values && valueRanges[0].values.length > 0) {
        const state: any = {};
        for (let i = 0; i < ranges.length; i++) {
           const rangeName = ranges[i];
           const stateKey = rangeName.charAt(0).toLowerCase() + rangeName.slice(1);
           state[stateKey] = parseFromSheet(valueRanges[i].values || []);
        }
        return state;
      }
    } catch (e: any) {
      console.error("Error reading from Google Sheets (Option B), falling back to local JSON", e.message);
    }
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading database file, resetting to defaults", e);
    }
  }
  
  // Create first backup default
  const defaultState = {
    members: initialMembers,
    branches: initialBranches,
    events: initialEvents,
    fundTransactions: initialFundTransactions,
    scholarships: initialScholarships,
    documents: initialDocuments,
    albums: initialAlbums,
    suggestions: [
      {
        id: "SUG_001",
        memberId: "NV-008",
        memberName: "Nguyễn Thị Lan",
        fieldName: "dob",
        oldValue: "1975",
        newValue: "1976",
        proposedBy: "atnguyen.skayer@gmail.com",
        proposedAt: "2026-06-17T15:00:00Z",
        status: "chờ duyệt"
      }
    ] as any[],
    logs: [
      {
        id: "LOG_001",
        user: "atnguyen.skayer@gmail.com",
        action: "Đăng nhập hệ thống",
        target: "Hệ thống Gia Phả",
        time: "2026-06-18T09:12:00Z"
      }
    ] as any[]
  };
  
  if (!process.env.VERCEL) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not write default state file.", e);
    }
  }
  return defaultState;
}

// Helper to save family database state
async function saveDatabaseState(state: any) {
  // Always keep local JSON as backup (if not on read-only Vercel)
  try {
    if (!process.env.VERCEL) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("Could not write local JSON backup (likely read-only environment).", e);
  }

  if (sheets && GOOGLE_SPREADSHEET_ID) {
    try {
      const ranges = ["Members", "Branches", "Events", "FundTransactions", "Scholarships", "Documents", "Albums", "Suggestions", "Logs"];
      const data = [];
      for (const rangeName of ranges) {
        const stateKey = rangeName.charAt(0).toLowerCase() + rangeName.slice(1);
        data.push({
          range: `${rangeName}!A1`,
          values: flattenToSheet(state[stateKey])
        });
      }

      // Xóa dữ liệu cũ trước khi ghi đè để tránh rác nếu số dòng giảm
      await sheets.spreadsheets.values.batchClear({
        spreadsheetId: GOOGLE_SPREADSHEET_ID,
        requestBody: {
          ranges: ranges.map(r => `${r}!A:Z`)
        }
      });

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: GOOGLE_SPREADSHEET_ID,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: data
        }
      });
    } catch (e: any) {
      console.error("Error writing to Google Sheets (Option B):", e.message);
      throw new Error("Không thể lưu lên Google Sheets: " + e.message);
    }
  }
}

// Helper to send Telegram notifications
async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      })
    });
  } catch (e: any) {
    console.error("Telegram notification failed:", e.message);
  }
}

// API Routes
app.get(["/api/test", "/test"], (req, res) => {
  res.json({ ok: true, url: req.url, vercel: !!process.env.VERCEL });
});

// 1. Core data retrieval helper
app.get(["/api/family-data", "/family-data"], async (req, res) => {
  const state = await loadDatabaseState();
  res.json(state);
});

// 2. Core data update helper
app.post(["/api/family-data", "/family-data"], async (req, res) => {
  try {
    const updatedState = req.body;
    if (!updatedState.members || !updatedState.branches) {
      return res.status(400).json({ error: "Dữ liệu không đúng cấu trúc" });
    }
    await saveDatabaseState(updatedState);
    const destination = sheets && GOOGLE_SPREADSHEET_ID ? "Google Sheets" : "Local JSON";
    
    // Asynchronously notify Telegram group
    const msg = `🔔 <b>Cập Nhật Gia Phả</b>\nDữ liệu mới vừa được lưu trữ thành công lên <b>${destination}</b> lúc ${new Date().toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"})}.\nThành viên hiện tại: ${updatedState.members.length} người.`;
    sendTelegramNotification(msg);

    res.json({ success: true, message: `Đã lưu trữ dữ liệu gia phả thành công sang ${destination}.` });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Initialize Gemini Client
const aiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (aiKey) {
  ai = new GoogleGenAI({
    apiKey: aiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environments. AI helpers will run in simulated mode.");
}

// 3. AI duplicate detection using Gemini 3.5 Flash
app.post("/api/ai/analyze-duplicate", async (req, res) => {
  const { memberName, dob, gender, branchId } = req.body;
  const state = await loadDatabaseState();
  const membersList = state.members.map((m: any) => ({
    id: m.id,
    fullName: m.fullName,
    dob: m.dob || "Không rõ",
    gender: m.gender,
    branch: m.branchId
  }));

  const prompt = `Bạn là một nhà nhân chủng học và chuyên gia số hóa gia phả giàu kinh nghiệm tại Việt Nam.
Chúng tôi có thành viên mới định thêm vào gia phả dòng họ:
Họ tên: ${memberName}
Năm sinh: ${dob || "Chưa rõ"}
Giới tính: ${gender}
Chi họ: ${branchId}

Dưới đây là một phần danh sách thành viên hiện có trong phả hệ dòng tộc:
${JSON.stringify(membersList, null, 2)}

Nhiệm vụ của bạn:
1. Hãy tìm xem có thành viên nào trong gia phả bị trùng lặp nghi ngờ với thành viên mới này không. (Đặc biệt lưu ý các lỗi nhập phao như nhầm lẫn 1-2 năm sinh, viết tắt, cùng chi dòng).
2. Hãy viết đánh giá bằng Tiếng Việt giàu tính xây dựng, chỉn chu, nêu rõ lý do tại sao nghi ngờ và tỷ lệ % khả năng trùng lặp của từng trường hợp.
3. Nếu không tìm thấy trường hợp nào khả nghi, hãy khẳng định "Không phát hiện trùng lặp phả hệ".

Định dạng phản hồi: Viết bằng văn phong trang trọng Việt Nam, trực tiếp đi vào nội dung một cách rành mạch và ngắn gọn dưới dạng Markdown để hiển thị trên Web App gia phả.`;

  try {
    let textResult = "";
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      textResult = response.text || "Không thể phân tích dữ liệu lúc này.";
    } else {
      // Simulation backup if API Key is not set
      const searchName = memberName.toLowerCase();
      const matches = state.members.filter((m: any) => {
        const lowerFullName = m.fullName.toLowerCase();
        return lowerFullName.includes(searchName) || searchName.includes(lowerFullName);
      });
      if (matches.length > 0) {
        textResult = `### [Mô Phỏng] Phát hiện ${matches.length} thành viên trùng tên nghi vấn:
${matches.map((m: any) => `- **${m.fullName}** (ID: ${m.id}, Sinh: ${m.dob || "Chưa rõ"}, Chi: ${m.branchId}) - Trùng khớp tên khoảng **85%**. Khuyến nghị kiểm tra kỹ đời và quan hệ cha mẹ để tránh trùng lặp ghi bạ.`).join("\n")}`;
      } else {
        textResult = "### [Mô Phỏng] Không phát hiện trùng lặp phả hệ nào khả nghi. Bạn có thể an tâm thêm thành viên này vào sơ đồ tộc.";
      }
    }
    res.json({ analysis: textResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. AI parentage/relationship hints using Gemini 3.5 Flash
app.post("/api/ai/suggest-relationship", async (req, res) => {
  const { memberId } = req.body;
  const state = await loadDatabaseState();
  const targetMember = state.members.find((m: any) => m.id === memberId);
  if (!targetMember) {
    return res.status(404).json({ error: "Thành viên không tồn tại" });
  }

  const eligibleParents = state.members.reduce((acc: any[], m: any) => {
    if (m.id !== memberId && m.gender === "Nam") {
      acc.push({
        id: m.id,
        fullName: m.fullName,
        dob: m.dob,
        generation: m.generation,
        branchId: m.branchId
      });
    }
    return acc;
  }, []);

  const prompt = `Chúng tôi đang quản lý một gia phả số dòng họ Nguyễn Văn và có thành viên sau đây bị khuyết thông tin Cha ruột/Tổ tông trực hệ:
Thế hệ/Đời: Đời thứ ${targetMember.generation}
Họ tên: ${targetMember.fullName}
Năm sinh: ${targetMember.dob || "Không rõ"}
Chi họ: ${targetMember.branchId}

Dưới đây là danh sách các trưởng bối Nam giới thuộc thế hệ đời thứ ${targetMember.generation - 1} hoặc đời trước nữa trong dòng tộc:
${JSON.stringify(eligibleParents, null, 2)}

Yêu cầu:
1. Hãy tìm và đề xuất 1-2 ứng viên có khả năng cao là Cha ruột của thành viên này. Tiêu chuẩn vàng:
   - Cách biệt tuổi tác phù hợp (Cha lớn hơn con từ 20 đến 45 tuổi).
   - Thế hệ của cha đúng bằng thế hệ của con trừ 1 (đời ${targetMember.generation - 1}).
   - Có cùng Chi họ (${targetMember.branchId}).
2. Trả về bài phân tích bằng Tiếng Việt có dẫn chứng và lập luận logic chặt chẽ của một Hội đồng Gia tộc có tri thức.
3. Nếu không có ứng viên nào đáp ứng, hãy gợi ý phân tích dòng phái chung để gia đình có hướng tìm thêm tư liệu cổ tộc.

Định dạng câu trả lời: Viết bằng văn phong trang trọng lịch thiệp trong tầm 3-4 câu chính xác dưới dạng Markdown.`;

  try {
    let textResult = "";
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      textResult = response.text || "Không thể phân tích liên kết thế hệ phả hệ lúc này.";
    } else {
      const parentGen = targetMember.generation - 1;
      const candidates = state.members.filter((m: any) => 
        m.generation === parentGen && 
        m.gender === "Nam" && 
        m.branchId === targetMember.branchId
      );
      if (candidates.length > 0) {
        textResult = `### [Mô Phỏng] Đề xuất Cha ruột hợp lý nhất:
${candidates.map((c: any) => `- **Cụ ${c.fullName}** (Đời ${c.generation}, Sinh ${c.dob || "Chưa rõ"}): Khoảng cách tuổi hợp lý tương đương **${Number(targetMember.dob || 0) - Number(c.dob || 0)}** tuổi và đều trực thuộc chi họ **${c.branchId}**.`).join("\n")}`;
      } else {
        textResult = `### [Mô Phỏng] Không tìm thấy Trưởng bối nam ở Đời thứ ${parentGen} trong cùng Chi ${targetMember.branchId} để đề xuất kết nối quan hệ. Bạn cần bổ sung thêm bối tự chi này trước.`;
      }
    }
    res.json({ analysis: textResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. AI generate biography
app.post(["/api/ai/generate-biography", "/ai/generate-biography"], async (req, res) => {
  const { member } = req.body;
  if (!member) {
    return res.status(400).json({ error: "Thiếu dữ liệu thành viên" });
  }

  const prompt = `Viết một tiểu sử gia tộc (Gia sử) vô cùng trang trọng, giàu xúc cảm hoài cổ, kính dâng anh linh tiên tổ cho thành viên dòng họ sau:
Họ tên: ${member.fullName}
Năm sinh: ${member.dob || "Không rõ"}
Ngày mất: ${member.isDeceased ? (member.dod || "Chưa rõ") : "Hiện đang tạ thế an nhiên tại nhân gian"}
Chi họ: ${member.branchId}
Học vấn/Nghề nghiệp: ${member.education || "Chưa rõ"} / ${member.profession || "Nông nghiệp / Tự do"}
Quê quán: ${member.hometown || "Quảng Nam"}
Thành tích / Ghi nhận tiêu biểu: ${member.achievements ? member.achievements.join(", ") : "Người trung hiếu, yêu thương con cháu gương mẫu"}

Hãy viết tiểu sử bằng Tiếng Việt chuẩn mực mang đậm nét chữ nghĩa xưa, tôn vinh đức hiền của cha ông, lòng thủy chung của bà mẹ, sự hiếu học của con cháu. Độ dài tầm 150-250 từ, trau chuốt từng lời bình, hành văn nho nhã thanh tú.`;

  try {
    let textResult = "";
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      textResult = response.text || "Không viết được phả chí lúc này.";
    } else {
      textResult = `Kính bái! Cụ ${member.fullName}, tự ${member.nickname || "Gia tộc hiền nhân"}, sinh năm ${member.dob || "khuyết lục"} tại vùng đất linh kiệt xã ${member.hometown || "Duy Xuyên, Quảng Nam"}. Trọn cuộc đời cụ là tấm gương sáng ngời của tinh thần can trường gầy dựng gia bản, trung nghĩa gia tộc, lấy lễ nghĩa truyền gia bảo để rèn cặp đàn con cháu đỗ đạt khoa bảng, hiếu thảo đức hạnh. ${member.isDeceased ? `Đại thọ viên mãn, cụ quy lăng tiên về cõi tiên cảnh vĩnh hằng ngày ${member.dod || "lục biên"}, để lại niềm tiếc thương vô hạn kính tri ân muôn đời của hậu sinh.` : `Nay cụ vẫn an hưởng tuổi cao bóng cả, tụ họp đoàn con hiền cháu thảo bái kiến phụng tổ đường.`}`;
    }
    res.json({ biography: textResult });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Wrap the server setup and listen in async-IIFE
(async () => {
  if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Failed to start Vite dev server", e);
    }
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to port 3000 on all interfaces (forced by AI Studio runtime proxy)
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Gia Phả] Server is up and running on port ${PORT}`);
    });
  }
})();

export default app;
