export const callGemini = async (prompt) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Gemini API Error:", errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        return candidate.content.parts[0].text;
      } else {
        console.error("Unexpected Gemini API response structure:", result);
        throw new Error('Invalid response structure from Gemini API.');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  };
  