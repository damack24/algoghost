import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Simple route check
app.get("/api/status", (req, res) => {
  res.json({ status: "AlgoGhostSignal server running ✅" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
