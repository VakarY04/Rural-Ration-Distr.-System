export const aiController = {
  processGrievance: async (req, res) => {
    try {
      const { userText } = req.body;

      if (!userText || userText.trim() === "") {
        return res.status(400).json({ error: "Grievance text parameter cannot be empty." });
      }

      // 1. Fetch the key dynamically inside the request lifecycle
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.includes('YOUR_GEMINI_API_KEY_HERE')) {
        return res.status(500).json({ 
          error: "Runtime Configuration Error: GEMINI_API_KEY was not initialized correctly by the server environment." 
        });
      }

      const prompt = `
        You are an AI automated routing engine for the Indian Government's Public Distribution System.
        Analyze the following text submitted by a rural citizen: "${userText}"
        
        Provide your analysis strictly in raw JSON format matching this exact schema:
        {
          "detectedLanguage": "Name of input language",
          "translatedEnglish": "Perfect translation of the issue into clear English text",
          "classificationTag": "Must choose exactly one of these: Supply Shortage, Distributor Misconduct, Technical Glitch, or General Inquiry",
          "nativeResolutionResponse": "A supportive, direct resolution response written natively in the citizen's detected language telling them their ticket has been forwarded to regional supervisors"
        }
        Do not wrap the response in markdown blocks or write any prose. Return raw JSON text only.
      `;

      // 2. Target the stable production v1 gateway explicitly to support the AQ. key format
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      const data = await response.json();

      // Catch any remote API layer rejections gracefully
      if (!response.ok) {
        return res.status(response.status).json({
          error: `Google API Gateway Error: ${data.error?.message || response.statusText}`
        });
      }

      // 3. Extract the text payload out of the standard REST response structure
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      if (!rawText) {
        throw new Error("Gemini returned an empty text payload.");
      }
      
      // Clean out any accidental markdown code block syntax formatting if present
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Parse the clean string safely into a JSON structure
      const processedMetrics = JSON.parse(cleanJson);

      return res.status(200).json({
        success: true,
        message: "AI analysis and zero-shot routing operations completed successfully.",
        analytics: processedMetrics
      });
    } catch (err) {
      return res.status(500).json({ 
        error: `AI Processing Engine Exception: ${err.message}` 
      });
    }
  }
};