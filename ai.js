const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');

dotenv.config();

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function generateSummary(messages) {
    const prompt = `Genera un riassunto conciso dei seguenti messaggi, dividendo per paragrafi se ci sono stati piu argomenti trattati, fallo in ordine cronologico
    \n\n${messages}\n\nRiassunto:`

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text
}

async function generateUserSummary(messages) {
    const prompt = `Questa è una lista di messaggi di un singolo utente, sono divisi con il simbolo [END] Genera una descrizione dell'utente in base ai suoi messaggi, puoi anche permetterti di giudicarlo in base a quello che scrive, sii descrittivo e dettagliato. Evita di utilizzare simboli di formattazione come asterischi, cancelletti o underscore.
    \n\n${messages}\nDescrizione:`

    const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text
}

module.exports = { generateSummary, generateUserSummary }