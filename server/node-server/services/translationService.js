/**
 * Translation service using Google Translate API.
 * Install: npm install @google-cloud/translate
 * Or: npm install google-translate-api-x (for free tier without auth)
 */

/**
 * Translate text from source language to target language
 * Using free API: https://translate.googleapis.com (unofficial)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'en', 'hi')
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, targetLang = "en", sourceLang = "en") {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text for translation");
  }

  if (sourceLang === targetLang) {
    return text; // No translation needed
  }

  try {
    // Using Google Translate free API (unofficial)
    const encoded = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/element.js?cb=googleTranslateElementInit&client=te&sl=${sourceLang}&tl=${targetLang}&text=${encoded}`;

    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encoded}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Translate API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract translated text from response
    // Response format: [[[translated_text, original_text, ...],...]]
    if (data && Array.isArray(data) && data.length > 0) {
      let translated = "";
      if (Array.isArray(data[0])) {
        translated = data[0]
          .map((item) => (Array.isArray(item) && item[0] ? item[0] : ""))
          .join("");
      }
      return translated.trim() || text;
    }

    return text;
  } catch (err) {
    console.error("Translation error:", err.message);
    // Return original text on error
    return text;
  }
}

/**
 * Translate Hindi to English
 * @param {string} hindiText - Hindi text
 * @returns {Promise<string>} - English translation
 */
export async function translateHindiToEnglish(hindiText) {
  return translateText(hindiText, "en", "hi");
}

/**
 * Translate English to Hindi
 * @param {string} englishText - English text
 * @returns {Promise<string>} - Hindi translation
 */
export async function translateEnglishToHindi(englishText) {
  return translateText(englishText, "hi", "en");
}
