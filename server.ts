import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for AI Recommendations
  app.post("/api/recommend-medicines", async (req, res) => {
    try {
      const { disease, inventory } = req.body;
      if (!disease) {
        return res.status(400).json({ error: "Disease query is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured on the server. Please add it via Settings." 
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const inventoryList = inventory && Array.isArray(inventory) 
        ? inventory.map(item => `${item.name} (${item.potency || ''}, type: ${item.type || ''})`).join(", ")
        : "No medicines in inventory";

      const prompt = `You are an expert Homeopathic clinical assistant assisting Dr. Haris Mehmood.
The doctor has entered the patient's symptoms or disease/diagnosis in Urdu: "${disease}".
The current clinic pharmacy inventory has these medicines:
[${inventoryList}]

Your task:
1. Translate/understand the Urdu symptoms or disease.
2. Recommend up to 5 relevant homeopathic medicines from the clinic's inventory list above that are indicated for these symptoms.
3. For each recommended medicine, provide a brief, clear explanation in simple Urdu (why it fits, and how to use it/dosage).
4. If no medicine in the inventory is a good fit, suggest 1-2 common homeopathic remedies that are helpful but mark them clearly as "Not in Inventory".

Format your response as a valid raw JSON array of objects with the exact structure below. Do not wrap in markdown or backticks (no \`\`\`json blocks). Just the pure JSON array:
[
  {
    "name": "Medicine Name",
    "inInventory": true,
    "reason": "اردو میں مختصر وجہ اور خوراک"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let text = response.text || "";
      // Strip any markdown code fence blocks if returned
      text = text.replace(/```json\s*/i, "").replace(/```\s*$/, "").trim();
      
      try {
        const recommendations = JSON.parse(text);
        res.json({ recommendations });
      } catch (parseErr) {
        console.error("Failed to parse Gemini response as JSON. Response text was:", text);
        res.json({ recommendations: [], rawResponse: text });
      }
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recommendations" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
