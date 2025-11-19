export const regenerateColorUserPrompt = ({ businessName, tagline, industry, brandStyles, typeOfWebsite }) => `
Generate a brand color palette for:
- Business Name: ${businessName}
- Tagline: ${tagline || 'N/A'}
- Industry: ${industry}
- Website Type: ${typeOfWebsite}
- Brand Styles: ${Array.isArray(brandStyles) ? brandStyles.join(', ') : brandStyles}

Requirements:
1. Return ONLY a JSON array of 5 HEX colors, like:
   ["#3B82F6", "#06B6D4", "#9333EA", "#F8FAFC", "#0F172A"]

2. Each index must represent:
   [0] = Primary
   [1] = Secondary
   [2] = Accent
   [3] = Background
   [4] = Text

3. Ensure excellent contrast and readability (WCAG compliant).

4. Use color psychology relevant to the brand:
   • Tech / SaaS → Blue, Indigo, Gray (trust, innovation)
   • Fitness / Wellness → Green, Orange, White (energy, vitality)
   • Luxury / Real Estate → Black, Gold, Deep Blue (premium, confidence)
   • Food / Hospitality → Red, Yellow, Cream (warmth, appetite)
   • Creative / Agency → Purple, Pink, Cyan (bold, expressive)

5. Do not include any additional fields, objects, or markdown.

If you cannot generate a valid palette, return exactly:
["#000000", "#000000", "#000000", "#FFFFFF", "#000000"]
`;

export const  regenerateColorsystemPrompt = [
      'You are a professional brand designer and color expert.',
      'Your task is to generate a cohesive color palette for a brand based on its industry, tone, and style.',
      'Always return a valid JSON array of exactly 5 color hex codes with no extra text or formatting.',
      'Each color must be WCAG accessible and emotionally aligned with the brand’s identity.',
      'Do not include any labels, descriptions, or explanations.',
    ].join(' ');