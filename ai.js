const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateSummary(messages)
{
  const prompt = `Genera un riassunto conciso dei seguenti messaggi, dividendo per paragrafi se ci sono stati piu argomenti trattati, fallo in ordine cronologico
    \n\n${messages}\n\nRiassunto:`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text
}

async function generateUserSummary(messages)
{
  const prompt = `Questa è una lista di messaggi di un singolo utente, sono divisi con il simbolo [END] Genera una descrizione dell'utente in base ai suoi messaggi, puoi anche permetterti di giudicarlo in base a quello che scrive, sii descrittivo e dettagliato ma anche sintetico, non esagerare con la lunghezza della descrizione. Evita di utilizzare simboli di formattazione come asterischi, cancelletti o underscore.
    \n\n${messages}\nDescrizione:`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text
}

async function generateCustomResponse(messages, customMessage)
{
  const prompt = `Questa è una lista di messaggi di un singolo utente, sono divisi con il simbolo [END]. Rispondi alla seguente richiesta dell'utente basandoti sui suoi messaggi:

${customMessage}

Messaggi dell'utente:
${messages}

Risposta:`

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text
}

module.exports = { generateSummary, generateUserSummary, generateCustomResponse }