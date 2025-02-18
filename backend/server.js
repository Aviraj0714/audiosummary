const express = require("express");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const dotenv = require("dotenv");
const textToSpeech = require("@google-cloud/text-to-speech");
const cors = require("cors");
const { exec } = require("child_process");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const OUTPUT_DIR = path.join(__dirname, "uploads");
fs.ensureDirSync(OUTPUT_DIR);

const ttsClient = new textToSpeech.TextToSpeechClient();

// 📌 Generate AI Summary Using Gemini
async function generateGeminiSummary(codeDiff) {
  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    {
      contents: [{ role: "user", parts: [{ text: `Explain the following code changes in a simple way:\n\n${codeDiff}` }] }], // Gemini input
    },
    {
      headers: { "Content-Type": "application/json" },
      params: { key: process.env.GEMINI_API_KEY },
    }
  );

  return response.data.candidates[0]?.content?.parts[0]?.text || "No explanation available.";
}

// 📌 Convert AI Summary to Speech
async function generateSpeech(text) {
  const speechFile = path.join(OUTPUT_DIR, "summary.mp3");

  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode: "en-US", ssmlGender: "MALE" },
    audioConfig: { audioEncoding: "MP3" },
  });

  fs.writeFileSync(speechFile, response.audioContent);
  return speechFile;
}

// 📌 API Endpoint to Generate Summary and Speech
app.post("/generate-summary-speech", async (req, res) => {
  try {
    const { codeDiff } = req.body;

    // 1️⃣ AI Summary from Gemini
    const explanation = await generateGeminiSummary(codeDiff);
    fs.writeFileSync(path.join(OUTPUT_DIR, "explanation.txt"), explanation);

    // 2️⃣ Convert AI Summary to Speech
    const audioFile = await generateSpeech(explanation);

    // 3️⃣ Sanitize the summary by escaping special characters
    const sanitizedSummary = explanation.replace(/([\\$'";#<>])/g, '\\$1');

    // 4️⃣ Respond with sanitized summary and audio file URL
    res.json({
      summary: sanitizedSummary, // Safe summary
      audioUrl: `/uploads/summary.mp3`, // Audio file URL
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Processing failed" });
  }
});

// 📌 Serve Audio Files
app.use("/uploads", express.static(OUTPUT_DIR));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
