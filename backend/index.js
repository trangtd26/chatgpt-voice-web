import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();
const PORT = 5001; // 🔥 ĐỔI SANG 5001

app.use(cors());
app.use(express.json());

const upload = multer();

// test api
app.get("/", (req, res) => {
  res.json({ message: "Backend OK 🚀" });
});

// chat api
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Thiếu message" });
  }

  // fake AI trả lời (sau này gắn OpenAI)
  const reply = `🤖 AI trả lời: "${message}"`;

  res.json({ reply });
});

// receive audio file and return a fake transcription (placeholder for real STT)
app.post('/speech', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });

  // In a real app you'd forward the buffer to a speech-to-text service.
  const size = req.file.buffer.length;
  const text = `⟲ (Giả lập) Đã nhận audio ${size} bytes`;

  res.json({ text });
});

app.listen(PORT, () => {
  console.log(`✅ Backend chạy tại http://localhost:${PORT}`);
});
