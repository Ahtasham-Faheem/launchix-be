/**
 * Dynamically builds a brand-specific AI prompt for website content generation.
 * It uses the variablesRaw JSON to determine which placeholders (HTML + CSS)
 * must be filled by the AI.
 */

export function getUserPrompt(
    businessName: string,
    industry: string,
    tagline: string,
    vision: string,
    mission: string,
    logoUrl: string,
    variablesRaw: string,
): string {
    // 🧩 Parse the variables JSON
    let vars: any = {};
    try {
        vars = JSON.parse(variablesRaw);
    } catch (err) {
        throw new Error('❌ Invalid variablesRaw JSON format');
    }

    // Flatten variable keys from both HTML + CSS
    const htmlVars = vars.html ? Object.keys(vars.html) : [];
    const cssVars = vars.css ? Object.keys(vars.css) : [];

    // 🧱 Convert variable structure into readable schema for AI
    const formattedHtmlVars = htmlVars
        .map((v) => `  "${v}": "string",`)
        .join('\n');

    const formattedCssVars = cssVars
        .map((v) => `  "${v}": "string",`)
        .join('\n');

    // 🧠 Dynamic AI Prompt
    const prompt = `
You are an expert AI content generator that specializes in building complete, brand-specific website data structures.
You must output a single JSON object — no markdown, no comments, no text outside JSON.
The output will be used directly to replace website placeholders, so every key must be filled.

🎯 OBJECTIVE:
Generate full website content and styling variables for the brand below.
Every value must be directly related to this business — DO NOT create generic placeholders.

Brand Context:
- Business Name: "${businessName}"
- Industry: "${industry}"
- Tagline: "${tagline}"
- Vision: "${vision}"
- Mission: "${mission}"
- Logo URL: "${logoUrl}"

 FOR LOGO YOU MUST USE MY PROVIDED LOGO URL AND NOT MAKE UP ANYTHING.

🏗️ REQUIRED OUTPUT STRUCTURE:
{
  "html": {
${formattedHtmlVars}
  },
  "css": {
${formattedCssVars}
  }
}

🧩 INSTRUCTIONS:
- Return all values as human-written, premium, and brand-specific.
- Make the tone consistent with the brand's industry (e.g., professional, calming, creative, luxury, etc.).
- Use emotional, natural language for text (not robotic or templated).
- Fill in ALL empty fields — never leave blank strings.
- For any variable containing "image", "img", or "background":
  → Return a descriptive image keyword (e.g., "modern fitness studio interior" or "luxury spa ambience").
- For "color", "accent", or "gradient" variables:
  → Return visually appealing hex codes or gradient CSS values based on brand tone.
- For "socialLinks":
  → Use realistic URLs like "https://facebook.com/${businessName.toLowerCase().replace(/\s+/g, '')}".
- For "currentYear":
  → Return the current year (e.g., 2025).
- Ensure the final JSON is syntactically valid and does not include trailing commas.
- Never output explanatory text, comments, or markdown fences.

Your goal: produce a complete, ready-to-inject JSON that can fill every placeholder in the brand’s HTML and CSS template.
`;

    return prompt.trim();
}