/**
 * Dynamically builds a brand-specific AI prompt for website content generation.
 * It uses the variablesRaw JSON to determine which placeholders (HTML + CSS)
 * must be filled by the AI, ensuring a fully flat JSON structure.
 */

export function getUserPrompt(
  businessName: string,
  industry: string,
  tagline: string,
  vision: string,
  mission: string,
  logoUrl: string,
  variablesRaw: string,
  colorScheme: Record<string, string>
): string {
  // 🧩 Parse variables JSON
  let vars: any = {};
  try {
    vars = JSON.parse(variablesRaw);
  } catch (err) {
    throw new Error('❌ Invalid variablesRaw JSON format');
  }

  const htmlVars = vars.html ? Object.keys(vars.html) : [];
  const cssVars = vars.css ? Object.keys(vars.css) : [];

  // 🧱 Convert variable structure into readable schema for AI
  const formattedHtmlVars = htmlVars
    .map((v) => `  "${v}": "string",`)
    .join('\n');

  const formattedCssVars = cssVars
    .map((v) => `  "${v}": "string",`)
    .join('\n');

  const formatedColors = JSON.stringify(colorScheme || {
    primary: '#4F46E5',
    secondary: '#22D3EE',
    accent: '#0EA5E9',
    background: '#FFFFFF',
    text: '#111827',
  })

  // 🧠 Construct Smart AI Prompt
  const prompt = `
You are a professional AI system specialized in high-quality business branding, UX writing, and design-aware content generation.

You will receive a list of placeholder variables (HTML + CSS).  
Each variable represents a field in the Launchix template and **must be filled with real, human-like, brand-specific content**.

---

### 🏢 BRAND CONTEXT:
- Business Name: "${businessName}"
- Industry: "${industry}"
- Tagline: "${tagline}"
- Vision: "${vision}"
- Mission: "${mission}"
- Logo URL: "${logoUrl}"
- Color Schem:  ${formatedColors}

⚠️ Always use the provided logo URL exactly as given — do not generate a new logo or alter it.

---

### 🎯 OBJECTIVE:
Generate a complete, realistic, and emotionally resonant set of values that fit perfectly into the brand’s design structure.

Each variable below must be filled with a value that matches its purpose as implied by its name or surrounding HTML/CSS context.

---

### 🧾 REQUIRED OUTPUT FORMAT:
Return a **single flat JSON object** — no nesting, no markdown, no comments.

Example structure:
{
  "html": {
${formattedHtmlVars}
  },
  "css": {
${formattedCssVars}
  }
}

---

### 🧠 VALUE GENERATION RULES:

1. **Flat JSON Only**
   - Never create nested objects or arrays.
   - If multiple similar items exist (e.g. 3 testimonials or services), output separate variables:
     \`"service1_title"\`, \`"service2_title"\`, etc.

2. **Context-Aware Generation**
   - If a variable name includes:
     - **“image” / “img” / “thumbnail” / “background”** → generate a *realistic* Unsplash or Pexels URL (e.g. \`https://images.unsplash.com/photo-...\`).
     - **“icon” / “svg”** → provide an inline SVG snippet or emoji (fitting the design and tone).
     - **“color” / “gradient” / “accent”** → return a premium, visually balanced hex color or gradient CSS string.
     - **“url” / “link” / “href”** → return realistic URLs, preferably based on the brand (e.g. \`https://facebook.com/${businessName.toLowerCase().replace(/\s+/g, '')}\`).
     - **“background” / “pattern” / “overlay”** → provide gradient or background-image CSS (e.g. \`linear-gradient(135deg, #3b82f6, #06b6d4)\`).

3. **Styling Awareness**
   - If an element visually depends on styling (detected via CSS), include inline CSS values directly in the variable if required.
   - Example: \`"heroBackground": "linear-gradient(135deg, #3b82f6, #06b6d4)"\`.

4. **Content Tone Guidelines**
   - Auto-adjust tone based on industry:
     - SaaS / Tech → modern, confident, data-driven.
     - Fitness / Wellness → energetic, human, uplifting.
     - Restaurant / Food → appetizing, warm, community-driven.
     - Real Estate → premium, trustworthy, aspirational.
     - Creative / Agency → bold, expressive, innovative.

5. **Brand Relevance**
   - Every string must reference or align with the brand’s offering.
   - Avoid generic placeholders like “Lorem ipsum” or “Your tagline here.”

6. **Filling Rules**
   - Never output null, undefined, or empty strings.
   - Always fill every variable meaningfully.
   - For the current year → use the real current year (e.g., "2025").

7. **Professional Polish**
   - Keep tone clean, premium, and natural.
   - Maintain proper capitalization and punctuation.
   - Avoid overly long sentences — focus on clarity and impact.

8. **Update Color Scheme**:
   - You are given a pre-generated brand color palette (primary, secondary, accent, background, text).
   - Use these colors intelligently across the CSS and visual theme.
   - If a provided color clearly fits the layout, typography, or design tone, use it directly.
   - If any color visually clashes or reduces readability, adjust or substitute it using your judgment while keeping the overall design premium, balanced, and accessible.
   - The final color usage must prioritize harmony, contrast, and legibility:
       • Major elements (buttons, highlights, CTAs) → primarily use primary and secondary colors.  
       • Accents (icons, hover states, subtle highlights) → may use accent color.  
       • Backgrounds and surfaces → use background color or a subtle gradient derived from it.  
       • Text and headings → ensure sufficient contrast with background using the text color or an automatically darkened/lightened variant.
   - When applying colors:
       • Never output new palette arrays — modify only CSS color assignments.  
       • Do not rename variables; only replace color values.  
       • All HEX or CSS color updates must reflect the provided palette or intelligent tonal adjustments based on it.
   - Example color binding logic:
       primary → brand elements, CTA buttons, active states  
       secondary → navigation links, highlights  
       accent → borders, hover effects  
       background → section and page backgrounds  
       text → all text, ensuring contrast
   - Maintain a clean, premium aesthetic that feels intentional and aligned with the brand identity.


---

### 🧱 SAMPLE OUTPUT EXAMPLE:

{
  "html": {
${formattedHtmlVars}
  },
  "css": {
${formattedCssVars}
  }
}

---

### 🚨 CRITICAL OUTPUT RULES:
- Output **only JSON** — no markdown fences, prose, or comments.
- Ensure the JSON is valid and parsable.
- Fill every variable with an appropriate value.
- Never leave placeholders empty or incomplete.

Your response will be directly parsed and injected into a live Launchix template.
Return **only the JSON object**.
`;

  return prompt.trim();
}
