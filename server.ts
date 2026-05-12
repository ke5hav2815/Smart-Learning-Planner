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

  // API Routes
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { tasks, sessions, subjects } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

      const prompt = `
        As a smart learning assistant, analyze the following student data and provide personalized study recommendations and a specific study plan.
        Subjects: ${JSON.stringify(subjects)}
        Tasks: ${JSON.stringify(tasks)}
        Recent Sessions: ${JSON.stringify(sessions)}

        Focus on:
        1. Priority tasks nearing deadlines.
        2. Subjects with less study time.
        3. Productivity tips based on session frequency.
        4. Clear, actionable steps.
        
        Return the response in JSON format:
        {
          "recommendations": [
            { "title": "...", "content": "...", "priority": "High|Medium|Low" }
          ],
          "plan": [
            { "title": "...", "description": "...", "subjectId": "...", "priority": "High|Medium|Low", "dueDate": "YYYY-MM-DD" }
          ],
          "productivityScore": number (0-100),
          "suggestion": "Overarching advice"
        }
        
        Ensure "subjectId" in the plan matches one of the provided subjects. If no subjects are provided, invent a generic subject but prioritize the ones given.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text;
      
      if (!responseText) {
        throw new Error("Empty response from AI");
      }
      
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      res.json(JSON.parse(cleanJson));
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
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
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
