import { GoogleGenAI, Type, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { UserProfile } from "../contexts/AuthContext";
import { getFirestore, doc, setDoc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCourse(
  topic: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  depth: 'Summary' | 'Deep Dive',
  userId: string,
  languagePreference: string
): Promise<string> {
  console.log("generateCourse called", { topic, difficulty, depth, languagePreference });
  try {
    const prompt = `Create a custom educational course about "${topic}". 
The intended difficulty is ${difficulty}. 
The depth of the course should be a ${depth}.
Respond in the language: ${languagePreference}. 
Return the response as a JSON object containing the course details.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: "A catchy title for the course" },
        description: { type: Type.STRING, description: "A brief description of what the user will learn" },
        category: { type: Type.STRING, description: "The general education category (e.g. Science, History, Math, Art)" },
        modules: {
          type: Type.ARRAY,
          description: "The list of modules in the course. Summaries should have 2-3 modules, Deep Dives should have 5-7 modules.",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING, description: "The actual educational content for this module, written in markdown. Should be detailed and engaging. Use emojis!" },
            },
            required: ["title", "content"]
          }
        }
      },
      required: ["title", "description", "category", "modules"]
    };

    console.log("Calling ai.models.generateContent");
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash", // Use flash model for speed and availability
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        systemInstruction: `You are an expert curriculum designer and AI tutor named Otieno for Umile. 
Generate engaging, accurate, and structured courses on any topic. 
Adjust the language, tone, and complexity strictly based on the user's constraints.
If the language is Sheng, use Kenyan urban slang but keep facts correct.`
      }
    });
    console.log("Received response from Gemini", response);

    const rawText = response.text || "";
    const cleanedText = rawText.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleanedText || "{}");

    const db = getFirestore();
    const courseId = doc(collection(db, 'courses')).id;

    const batch = writeBatch(db);

    // Set the course
    batch.set(doc(db, 'courses', courseId), {
      title: parsed.title || "Untitled Course",
      description: parsed.description || "No description",
      category: parsed.category || "General",
      difficulty,
      isPublished: true, // Auto-publish for the user
      creatorId: userId,
      createdAt: serverTimestamp()
    });

    // Set the modules
    if (Array.isArray(parsed.modules)) {
      parsed.modules.forEach((mod: any, index: number) => {
        const moduleId = doc(collection(db, `courses/${courseId}/modules`)).id;
        batch.set(doc(db, `courses/${courseId}/modules`, moduleId), {
          courseId: courseId,
          title: mod.title || "Untitled Module",
          content: mod.content || "No content",
          order: index
        });
      });
    }

    await batch.commit();
    return courseId;
  } catch (error) {
    console.error("Error in generateCourse:", error);
    throw error;
  }
}
export async function generateSpeech(text: string): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Puck' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}
export async function playSpeech(base64Data: string) {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const buffer = new Int16Array(bytes.buffer);

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const sampleRate = 24000;
  const audioBuffer = ctx.createBuffer(1, buffer.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    channelData[i] = buffer[i] / 32768.0;
  }
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start(0);
}

export async function createChat(userProfile: UserProfile): Promise<Chat> {
  const systemInstruction = `You are an AI tutor named Otieno for a general education application called Umile.
Always respond to the user in their preferred language: ${userProfile.languagePreference}. 
If the user's preferred language is Sheng, prioritize using Kenyan urban slang (Sheng) while ensuring the facts are totally accurate. 
If it is Swahili, use standard Swahili.
If it is English, use clear and plain English.
You can use emojis to make the learning fun! Provide simple analogies. 
You can use standard markdown syntax.`;

  return ai.chats.create({
    model: 'gemini-3.1-flash',
    config: {
      systemInstruction,
    }
  });
}
