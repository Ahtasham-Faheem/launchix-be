export const buildLogoPrompt = (data: {
    brandName: string;
    tagline?: string;
    industry?: string;
    colorScheme?: string;
    fontFamily?: string;
    styles?: string[];
}) => {
    const { brandName, tagline, industry, colorScheme, fontFamily, styles } = data;

    return `
You are a professional logo designer AI.

Create a logo concept for:
- Brand Name: ${brandName}
${tagline ? `- Tagline: ${tagline}` : ''}
${industry ? `- Industry: ${industry}` : ''}

Design Preferences:
${colorScheme ? `- Color Scheme: ${colorScheme}` : '- Use modern color harmony'}
${fontFamily ? `- Font Family: ${fontFamily}` : '- Use readable, brand-appropriate fonts'}
${styles?.length ? `- Style: ${styles.join(', ')}` : '- Modern, clean, premium'}

Output should describe:
1. Logo concept (symbolism + layout)
2. Color palette (hex codes)
3. Font recommendation
4. Minimalistic vector sketch idea (text-based description)
  `;
};
