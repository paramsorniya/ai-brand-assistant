import cors from "cors";
import express from "express";
import { initDB } from "./db";
import brandsRouter from "./routes/brands";
import chatRouter from "./routes/chat";

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/brands", brandsRouter);
app.use("/api/chat", chatRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  try {
    await initDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
}

void start();
