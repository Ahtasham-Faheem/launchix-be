// /**
//  * Complete Website Generation Prompt
//  * Generates a full multi-section HTML page with CSS and JavaScript
//  */

// export interface WebsiteGenerationInput {
//   businessName: string;
//   industry: string;
//   tagline: string;
//   vision: string;
//   mission: string;
//   logoUrl: string;
//   colorScheme: {
//     primary: string;
//     secondary: string;
//     accent: string;
//     background: string;
//     text: string;
//   };
//   sections: string[]; // e.g., ['hero', 'about', 'services', 'team', 'contact']
//   features?: string[]; // Optional specific features
//   contactEmail?: string;
//   contactPhone?: string;
//   socialLinks?: {
//     facebook?: string;
//     twitter?: string;
//     instagram?: string;
//     linkedin?: string;
//   };
// }

// export function generateCompleteWebsitePrompt(input: WebsiteGenerationInput): string {
//   const {
//     businessName,
//     industry,
//     tagline,
//     vision,
//     mission,
//     logoUrl,
//     colorScheme,
//     sections,
//     features = [],
//     contactEmail = '',
//     contactPhone = '',
//     socialLinks = {},
//   } = input;

//   const sectionsList = sections.join(', ');
//   const featuresList = features.length > 0 ? features.join(', ') : 'modern design, smooth scrolling, responsive layout';

//   return `
// You are an expert web developer specializing in creating professional, modern, and fully functional single-page websites.

// Generate a **complete, production-ready HTML file** with embedded CSS and JavaScript for a multi-section business website.

// ---

// ### 🏢 BUSINESS CONTEXT:
// - **Business Name**: ${businessName}
// - **Industry**: ${industry}
// - **Tagline**: ${tagline}
// - **Vision**: ${vision}
// - **Mission**: ${mission}
// - **Logo URL**: ${logoUrl}
// - **Contact Email**: ${contactEmail || 'contact@' + businessName.toLowerCase().replace(/\s+/g, '') + '.com'}
// - **Contact Phone**: ${contactPhone || '+1 (555) 123-4567'}

// ### 🎨 COLOR SCHEME:
// \`\`\`json
// ${JSON.stringify(colorScheme, null, 2)}
// \`\`\`

// ### 📑 REQUIRED SECTIONS:
// Create the following sections in order: **${sectionsList}**

// ### ⚡ REQUIRED FEATURES:
// Include: ${featuresList}

// ### 🔗 SOCIAL MEDIA:
// ${Object.entries(socialLinks).map(([platform, url]) => `- ${platform}: ${url}`).join('\n') || '- Generate realistic social media URLs'}

// ---

// ## 🎯 GENERATION REQUIREMENTS:

// ### 1. **HTML Structure**
// - Create a complete, valid HTML5 document
// - Include proper DOCTYPE, meta tags, and viewport settings
// - Use semantic HTML5 elements (header, nav, section, footer, etc.)
// - Each section must have a unique ID matching the section name (e.g., id="hero", id="about", id="services")
// - Add smooth scroll behavior
// - Include proper heading hierarchy (h1, h2, h3)

// ### 2. **Navigation**
// - Create a fixed/sticky navigation bar at the top
// - Include logo/brand name on the left
// - Navigation links on the right that link to sections using anchor tags (#hero, #about, #services, etc.)
// - Mobile-responsive hamburger menu with smooth toggle animation
// - Active link highlighting based on scroll position

// ### 3. **Section Guidelines**

// **Hero Section:**
// - Eye-catching headline and subheadline
// - Clear call-to-action button(s)
// - Background image or gradient
// - Minimum height: 100vh

// **About Section:**
// - Company story and mission
// - Key highlights or values (2-4 items)
// - Professional image placeholder

// **Services/Features Section:**
// - 3-6 service/feature cards
// - Icons or images for each
// - Brief descriptions
// - Hover effects

// **Team Section (if included):**
// - 3-4 team member cards
// - Profile photos (use Picsum Photos: https://picsum.photos/400/400?random=X)
// - Names, roles, and brief bios

// **Portfolio/Projects Section (if included):**
// - 4-6 project cards in a grid
// - Project images with overlay effects
// - Project names and descriptions

// **Testimonials Section (if included):**
// - 3-4 client testimonials
// - Client names and companies
// - Star ratings or quotes

// **Pricing Section (if included):**
// - 3 pricing tiers
// - Feature lists for each tier
// - Call-to-action buttons

// **FAQ Section (if included):**
// - 5-8 common questions
// - Accordion-style expanding answers
// - Smooth expand/collapse animations

// **Contact Section:**
// - Contact form (name, email, message fields)
// - Contact information display
// - Social media links
// - Optional: embedded map placeholder

// **Footer:**
// - Quick links to all sections
// - Social media icons
// - Copyright notice
// - Additional company info

// ### 4. **CSS Styling (Embedded in <style> tag)**

// **Design Requirements:**
// - Modern, clean, and professional aesthetic
// - Use the provided color scheme throughout
// - Responsive design (mobile-first approach)
// - Breakpoints: 
//   * Mobile: < 768px
//   * Tablet: 768px - 1024px
//   * Desktop: > 1024px
// - Typography:
//   * Use Google Fonts (import 2 complementary fonts)
//   * Clear hierarchy with consistent sizing
// - Spacing:
//   * Consistent padding and margins
//   * Section padding: 80px-120px (desktop), 40px-60px (mobile)
// - Cards and Components:
//   * Box shadows for depth
//   * Border radius: 8-16px
//   * Smooth transitions (0.3s ease)
// - Buttons:
//   * Primary buttons use primary color
//   * Hover effects (scale, color change, shadow)
//   * Padding: 12px 32px
//   * Border radius: 8px
// - Images:
//   * Use object-fit: cover
//   * Lazy loading attribute
//   * Aspect ratios maintained
// - Color Usage:
//   * Primary: Main brand elements, CTAs, highlights
//   * Secondary: Links, secondary buttons, accents
//   * Accent: Borders, icons, hover states
//   * Background: Page background, cards
//   * Text: All text content (ensure contrast > 4.5:1)

// **CSS Best Practices:**
// - Use CSS Grid and Flexbox for layouts
// - Mobile-first media queries
// - CSS variables for colors and common values
// - Smooth transitions for interactive elements
// - Hover and focus states for all interactive elements

// ### 5. **JavaScript Functionality (Embedded in <script> tag)**

// **Required Interactions:**

// 1. **Smooth Scrolling:**
//    - Smooth scroll to sections when clicking nav links
//    - Offset for fixed header

// 2. **Mobile Menu Toggle:**
//    - Hamburger icon animation
//    - Slide-in/fade-in menu
//    - Close on link click
//    - Prevent body scroll when menu open

// 3. **Active Navigation Highlighting:**
//    - Detect current section in viewport
//    - Update active nav link based on scroll position
//    - Add 'active' class to current link

// 4. **Scroll Animations:**
//    - Fade-in animations for sections on scroll
//    - Intersection Observer API for performance
//    - Stagger animations for cards/items

// 5. **Form Handling:**
//    - Form validation (required fields, email format)
//    - Submit button loading state
//    - Success/error messages
//    - Prevent default form submission (since backend not connected)

// 6. **Accordion/FAQ (if FAQ section exists):**
//    - Toggle expand/collapse
//    - Smooth height transitions
//    - Close others when one opens (optional)

// 7. **Image Gallery/Lightbox (if portfolio exists):**
//    - Click to enlarge images
//    - Modal/lightbox overlay
//    - Previous/next navigation
//    - Close with X or outside click

// 8. **Counter Animations (if stats/numbers exist):**
//    - Animate numbers counting up
//    - Trigger on scroll into view

// 9. **Scroll-to-Top Button:**
//    - Show/hide based on scroll position
//    - Smooth scroll to top

// **JavaScript Best Practices:**
// - Use modern ES6+ syntax
// - No jQuery - vanilla JavaScript only
// - Event delegation where appropriate
// - Debounce scroll events
// - Mobile-friendly touch events

// ### 6. **Images**
// - Use Picsum Photos for all placeholder images
// - Format: \`https://picsum.photos/{width}/{height}?random={unique_number}\`
// - Sizes:
//   * Hero: 1920x1080 or full-width background
//   * Services/Features: 600x400
//   * Team: 400x400
//   * Portfolio: 800x600
//   * Testimonials: 100x100 (profile pics)
// - Include alt text for accessibility
// - Increment random numbers: ?random=1, ?random=2, ?random=3, etc.

// ### 7. **Accessibility**
// - Semantic HTML elements
// - ARIA labels where needed
// - Alt text for all images
// - Keyboard navigation support
// - Focus visible indicators
// - Sufficient color contrast (WCAG AA minimum)

// ### 8. **Performance**
// - Inline critical CSS
// - Defer non-critical scripts
// - Lazy load images (loading="lazy")
// - Minified inline styles and scripts (optional)
// - Optimize font loading

// ---

// ## 📝 OUTPUT FORMAT:

// Return **ONLY** a complete HTML file with the following structure:

// \`\`\`html
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <meta name="description" content="[Generate SEO-friendly description]">
//     <title>${businessName} - ${tagline}</title>
    
//     <!-- Google Fonts -->
//     <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//     <link href="https://fonts.googleapis.com/css2?family=[Font1]&family=[Font2]&display=swap" rel="stylesheet">
    
//     <style>
//         /* CSS VARIABLES */
//         :root {
//             --primary: ${colorScheme.primary};
//             --secondary: ${colorScheme.secondary};
//             --accent: ${colorScheme.accent};
//             --background: ${colorScheme.background};
//             --text: ${colorScheme.text};
//             /* Add more variables as needed */
//         }
        
//         /* RESET & BASE STYLES */
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//         }
        
//         html {
//             scroll-behavior: smooth;
//         }
        
//         body {
//             font-family: [Font], sans-serif;
//             color: var(--text);
//             background: var(--background);
//             line-height: 1.6;
//         }
        
//         /* ALL CSS GOES HERE */
//         /* ... */
//     </style>
// </head>
// <body>
//     <!-- NAVIGATION -->
//     <nav id="navbar">
//         <!-- Navigation content -->
//     </nav>
    
//     <!-- HERO SECTION -->
//     <section id="hero">
//         <!-- Hero content -->
//     </section>
    
//     <!-- OTHER SECTIONS -->
//     <!-- Generate all requested sections -->
    
//     <!-- FOOTER -->
//     <footer>
//         <!-- Footer content -->
//     </footer>
    
//     <script>
//         // ALL JAVASCRIPT GOES HERE
        
//         // Smooth scrolling
//         // Mobile menu
//         // Active nav highlighting
//         // Scroll animations
//         // Form handling
//         // All other interactive features
//     </script>
// </body>
// </html>
// \`\`\`

// ---

// ## 🚨 CRITICAL RULES:

// 1. **Single File Output**: Everything must be in ONE HTML file
// 2. **No External Dependencies**: No external CSS/JS files (except Google Fonts)
// 3. **Complete & Functional**: Every feature must work out of the box
// 4. **Responsive**: Must work on mobile, tablet, and desktop
// 5. **Professional Quality**: Production-ready code with proper formatting
// 6. **Real Content**: Use realistic, engaging copy - NO "Lorem ipsum" or generic placeholders
// 7. **Proper Syntax**: Valid HTML5, CSS3, and ES6+ JavaScript
// 8. **Comments**: Add brief comments for major sections
// 9. **Industry-Appropriate**: Match tone and imagery to the business industry
// 10. **Color Consistency**: Strictly use the provided color scheme

// ---

// ## 🎨 TONE & CONTENT GUIDELINES:

// Match the content tone to the industry:
// - **SaaS/Tech**: Modern, innovative, data-driven language
// - **Healthcare**: Professional, trustworthy, caring
// - **Finance**: Secure, reliable, professional
// - **Fitness**: Energetic, motivational, empowering
// - **Food/Restaurant**: Appetizing, warm, inviting
// - **Real Estate**: Premium, aspirational, trustworthy
// - **Creative/Agency**: Bold, innovative, expressive
// - **Legal**: Professional, authoritative, trustworthy
// - **Education**: Informative, supportive, growth-focused

// ---

// ## ✅ VALIDATION CHECKLIST:

// Before returning the HTML, verify:
// - [ ] All sections from the list are included
// - [ ] Navigation links work (anchor tags match section IDs)
// - [ ] Mobile menu opens and closes
// - [ ] Color scheme is applied throughout
// - [ ] All images use Picsum Photos with unique random numbers
// - [ ] Contact form has validation
// - [ ] Scroll animations work
// - [ ] Active nav highlighting works
// - [ ] All interactive elements have hover states
// - [ ] Responsive on all screen sizes
// - [ ] No console errors
// - [ ] Professional, realistic content (no Lorem ipsum)

// ---

// ## 🚀 FINAL INSTRUCTION:

// Generate the complete HTML file now. Return ONLY the HTML code - no explanations, no markdown code fences, no additional text.

// The output should start with \`<!DOCTYPE html>\` and end with \`</html>\`.
// `;
// }










export interface WebsiteGenerationInput {
  businessName: string;
  industry: string;
  tagline: string;
  vision: string;
  mission: string;
  logoUrl: string;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  sections: string[]; // e.g., ['hero', 'about', 'services', 'team', 'contact']
  features?: string[]; // Optional specific features
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}


export function generateCompleteWebsitePrompt(input: WebsiteGenerationInput): string {
  const {
    businessName,
    industry,
    tagline,
    vision,
    mission,
    logoUrl,
    colorScheme,
    sections,
    features = [],
    contactEmail = '',
    contactPhone = '',
    socialLinks = {},
  } = input;

  const sectionsList = sections.join(', ');
  const featuresList =
    features.length > 0
      ? features.join(', ')
      : 'modern premium design, gradient layering, smooth scrolling, responsive grid layout, animated sections, product showcase, eCommerce-ready interactions';

  return `
You are a **world-class UI/UX and front-end engineer** who builds visually stunning, conversion-focused eCommerce landing pages that feel like Apple, Shopify, and Framer websites.

Your task: Generate a **complete, production-ready single-page website** (HTML + embedded CSS + JS) that feels elegant, high-end, and visually balanced.

---

### 🏢 BUSINESS CONTEXT
- **Business Name:** ${businessName}
- **Industry:** ${industry}
- **Tagline:** ${tagline}
- **Vision:** ${vision}
- **Mission:** ${mission}
- **Logo URL:** ${logoUrl}
- **Contact Email:** ${contactEmail || 'contact@' + businessName.toLowerCase().replace(/\s+/g, '') + '.com'}
- **Contact Phone:** ${contactPhone || '+1 (555) 123-4567'}

### 🎨 COLOR PALETTE
json
${JSON.stringify(colorScheme, null, 2)}


### 📑 REQUIRED SECTIONS
Render the following sections in order: **${sectionsList}**
If eCommerce context is detected, also include: **products**, **showcase**, or **shop** sections automatically.

### ⚡ REQUIRED FEATURES
Include: ${featuresList}

### 🔗 SOCIAL LINKS
${'- Generate realistic social links'}

---

## 🧠 DESIGN INTENT — “PREMIUM” LOOK & FEEL
Build a design that feels custom-built by a professional agency:
- **Large hero visuals** with gradient overlays or full-width imagery.
- **Glassmorphism & soft shadows** for depth.
- **Vivid gradient CTAs** (from primary → secondary).
- **3D-style product cards** with hover lift & scale.
- **Elegant spacing:** generous whitespace, balanced typography scale.
- **Typography:** modern sans-serif (e.g. Poppins + Inter), bold headlines, lighter paragraph weights.
- **Color balance:** primary for CTAs, secondary for accents, subtle backgrounds.
- **Motion:** fade-up or slide-in animations on scroll.
- **Responsiveness:** mobile-first layout; scale gracefully to tablet and desktop.
- **Hero CTA example:** “Shop Now”, “Explore Collection”, or “Get Yours”.

---

## 🎯 STRUCTURE & CONTENT

### 🦸 HERO
- Full-screen hero with product image or lifestyle shot.
- Overlay gradient background.
- Headline (large), subheadline, CTA button.
- Optional subtle animated background (gradient shift or motion blob).

### 💡 ABOUT
- Story section with split layout: text left, image right.
- Bullet points for values or highlights.
- Clean card or gradient box background.

### 🛍️ PRODUCTS / SHOWCASE
- Grid of 4–8 premium product cards:
  - Image, name, price, short tagline, and CTA.
  - Optional “New”, “Best Seller”, or “Discount” badge.
  - Hover: elevate, scale slightly, and reveal “Add to Cart” or “Quick View”.
- Gradient background section divider or subtle wave transition.

### 🧰 FEATURES / BENEFITS
- 3–6 icon cards for brand strengths (“Free Shipping”, “30-Day Returns”, “Eco Materials”).
- Each with animated icon or subtle pulse effect.

### ⭐ TESTIMONIALS
- 3–5 testimonials in a carousel or grid.
- Circular user images, quote marks, 5-star icons.

### 💬 FAQ
- Accordion-style interaction.
- Animated open/close with smooth shadow transitions.
- Clean glass-like cards or soft gradient backgrounds.

### 📞 CONTACT
- Contact form (name, email, message).
- Map or brand imagery background.
- Social icons as rounded gradient buttons.

### ⚫ FOOTER
- Solid or gradient background.
- Navigation links, copyright, and social icons.
- Keep minimalist with clear alignment.

---

## 🎨 CSS STYLING

**Style Principles**
- Use embedded <style> with:
  - CSS variables for colors
  - Flexbox + Grid
  - Smooth transitions
- Font hierarchy:
  - Headings: "Poppins", sans-serif
  - Text: "Inter", sans-serif
- Section spacing: 100px desktop, 60px tablet, 40px mobile.
- CTA buttons:
  - Gradient background
  - Rounded (border-radius: 9999px)
  - Hover: scale(1.05), drop shadow.
- Product cards:
  - Rounded corners, box-shadow, hover lift.
- FAQ cards:
  - Blurred translucent background (glassmorphism)
  - Expand with smooth height transition.
- Navbar:
  - Sticky, semi-transparent blur background.
  - Logo on left, links right, cart badge visible.

---

## 🧩 JAVASCRIPT INTERACTIVITY
Use inline <script> and vanilla JS:
1. Smooth scroll nav links.
2. Active link highlight.
3. Mobile hamburger open/close animation.
4. Intersection Observer for fade-in sections.
5. Add-to-cart counter increment.
6. Accordion toggle for FAQs.
7. Optional simple image lightbox for products.

---

## 🖼️ IMAGE SOURCES
Use Picsum placeholders:
- Hero: 1920x1080
- Product: 600x600
- Team/Testimonial: 400x400
Include unique random IDs and alt text for all.

---

## ♿ ACCESSIBILITY
- Semantic HTML5.
- Alt text for all images.
- Keyboard navigable menus.
- Sufficient color contrast.

---

## ⚙️ PERFORMANCE
- Inline minified CSS + JS.
- Lazy-load images.
- Use modern CSS only (no external libs).

---

## ✅ CHECKLIST BEFORE RETURN
- [ ] Premium visual quality
- [ ] Hero & product sections look modern
- [ ] Hover + scroll animations
- [ ] CTA buttons visually dominant
- [ ] Cart counter works
- [ ] Fully responsive
- [ ] No “Lorem ipsum” text
- [ ] HTML starts with <!DOCTYPE html> and ends with </html>

---

Return **only** the full, valid HTML document—no markdown fences, no extra text.
`;
}
