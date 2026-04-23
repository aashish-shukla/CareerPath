import axios from "axios";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { Chat } from "../models/Chat.js";
import { logger } from "../utils/logger.js";

export async function getChatHistory(req, res, next) {
  try {
    let chat = await Chat.findOne({ userId: req.user.sub });
    if (!chat) {
      chat = await Chat.create({ userId: req.user.sub, messages: [] });
    }
    res.json({ messages: chat.messages });
  } catch (err) {
    next(err);
  }
}

export async function chatWithCareerCopilot(req, res, next) {
  try {
    const { message, context } = req.body ?? {};
    if (!message || typeof message !== "string") {
      throw new HttpError(400, "Message is required");
    }

    // 1. Save User Message to DB
    let chat = await Chat.findOne({ userId: req.user.sub });
    if (!chat) {
      chat = await Chat.create({ userId: req.user.sub, messages: [] });
    }
    chat.messages.push({ role: "user", text: message });
    await chat.save();

    const profileSummary =
      context?.profileSummary ??
      "No structured profile summary was provided. The user is a student or fresher exploring options.";

    const systemInstruction = 
      "You are a concise, practical career copilot called CareerPath AI. You help students and early-career professionals " +
      "understand career paths, skill gaps, and next steps. " +
      "ALWAYS use Markdown formatting for clarity. Use bold text for key terms, and use bullet points or numbered lists for steps. " +
      "Keep answers highly structured, short (max 150 words), and avoid generic introductions.";

    const prompt = `
      Context about the user: ${profileSummary}
      
      User says: ${message}
      
      Respond using Markdown with clear sections. Focus on concrete skills or steps.
    `;

    try {
      logger.info(`[Ollama] Streaming chat prompt for user message: "${message.slice(0, 50)}..."`);
      
      const response = await axios.post(`${env.OLLAMA_BASE_URL}/api/generate`, {
        model: env.OLLAMA_MODEL,
        system: systemInstruction,
        prompt: prompt,
        stream: true, // Enable streaming
      }, {
        responseType: 'stream'
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullText = "";
      let clientDisconnected = false;

      // Handle client disconnect — stop processing if browser tab is closed
      req.on('close', () => {
        clientDisconnected = true;
        if (response.data?.destroy) {
          response.data.destroy();
        }
        logger.info(`[Chat] Client disconnected mid-stream for user ${req.user.sub}`);
      });

      response.data.on('data', (chunk) => {
        if (clientDisconnected) return;

        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullText += parsed.response;
              if (!clientDisconnected) {
                res.write(`data: ${JSON.stringify({ text: parsed.response })}\n\n`);
              }
            }
            if (parsed.done) {
              // Save to DB when done — with proper error handling
              (async () => {
                const finalChat = await Chat.findOne({ userId: req.user.sub });
                if (finalChat) {
                  finalChat.messages.push({ role: "assistant", text: fullText });
                  await finalChat.save();
                }
              })().catch(err => logger.error("Failed to save assistant message to DB", err?.message ?? err));

              if (!clientDisconnected) {
                res.write('data: [DONE]\n\n');
                res.end();
              }
            }
          } catch (e) {
            logger.error("Error parsing stream line:", e?.message ?? e);
          }
        }
      });

    } catch (err) {
      logger.error("Ollama Chat Error:", err?.response?.data || err.message);
      if (!res.headersSent) {
        res.json({ reply: "My local brain (Ollama) is a bit slow or disconnected. Please ensure Ollama is running with the correct model." });
      }
    }
  } catch (err) {
    next(err);
  }
}

export async function clearChatHistory(req, res, next) {
  try {
    await Chat.deleteOne({ userId: req.user.sub });
    res.json({ message: "Chat history cleared" });
  } catch (err) {
    next(err);
  }
}

