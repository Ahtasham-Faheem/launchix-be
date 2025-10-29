export const websitePrompt = (context: any) => `
You are an expert website designer creating a premium, professional website in GrapesJS format.

BUSINESS INFORMATION:
- Business Name: ${context.businessName}
- Tagline: ${context.tagline}
- Vision: ${context.vision}
- Mission: ${context.mission}
- Industry: ${context.industry}

YOUR TASK:
Generate a complete, production-ready website with:
1. **AI-Generated Color Scheme** based on brand personality and industry
2. **Valid, working image URLs** from free sources (Unsplash, Pexels, Picsum)
3. **Working logo placeholder** with brand colors
4. **GrapesJS-compatible JSON structure**
5. **Fully styled, responsive design**

CRITICAL: ALL IMAGE URLS MUST BE REAL AND WORKING!

═══════════════════════════════════════════════════════
COLOR SCHEME GENERATION
═══════════════════════════════════════════════════════

Generate a UNIQUE color palette (5 colors) based on:
- Industry psychology (tech=blue, food=red/orange, finance=blue/green, etc.)
- Brand personality (modern, luxury, friendly, bold, etc.)
- Target audience (young, corporate, premium, etc.)

Color structure:
1. **Primary** - Main brand color (based on industry + personality)
2. **Secondary** - Complementary accent color
3. **Accent** - For CTAs and highlights (high contrast)
4. **Background** - Light background color
5. **Text** - Dark text color (ensure WCAG contrast)

Return colors as hex codes (e.g., "#4F46E5")

Examples by industry (but generate UNIQUE colors for THIS brand):
- Tech: Blues, purples, cyans
- Restaurant: Reds, oranges, warm tones
- Fitness: Energetic reds, oranges, teals
- Finance: Professional blues, greens
- Healthcare: Calming cyans, greens
- Retail: Bold reds, oranges, purples
- Creative: Vibrant pinks, purples, yellows
- Luxury: Dark tones, metallics (blacks, golds)

═══════════════════════════════════════════════════════
IMAGE SOURCES (USE ONLY THESE - THEY WORK!)
═══════════════════════════════════════════════════════

**UNSPLASH (Preferred - High Quality):**
Format: https://images.unsplash.com/photo-[PHOTO_ID]?auto=format&fit=crop&w=[WIDTH]&q=80

Real working photo IDs by category:

TECH/BUSINESS:
- Modern office: photo-1497366216548-37526070297c
- Team collaboration: photo-1522071820081-009f0129c71c
- Laptop workspace: photo-1551434678-e076c223a692
- Business meeting: photo-1600880292203-757bb62b4baf
- Tech devices: photo-1498050108023-c5249f4df085

RESTAURANT/FOOD:
- Restaurant interior: photo-1517248135467-4c7edcad34c4
- Fine dining: photo-1414235077428-338989a2e8c0
- Food plating: photo-1504674900247-0877df9cc836
- Chef cooking: photo-1556910103-1c02745aae4d
- Restaurant atmosphere: photo-1550966871-3ed3cdb5ed0c

FITNESS/GYM:
- Gym equipment: photo-1534438327276-14e5300c3a48
- Fitness class: photo-1571019614242-c5c5dee9f50b
- Workout: photo-1571902943202-507ec2618e8f
- Gym interior: photo-1534438327276-14e5300c3a48
- Active lifestyle: photo-1476480862126-209bfaa8edc8

FINANCE/CONSULTING:
- Business desk: photo-1454165804606-c3d57bc86b40
- Analytics: photo-1460925895917-afdab827c52f
- Professional: photo-1507679799987-c73779587ccf
- Office meeting: photo-1497366811353-6870744d04b2

HEALTHCARE/MEDICAL:
- Medical facility: photo-1576091160399-112ba8d25d1d
- Healthcare team: photo-1582719471384-894fbb16e074
- Medical equipment: photo-1519494026892-80bbd2d6fd0d
- Hospital: photo-1519494140681-8b17d830a3e9

RETAIL/SHOPPING:
- Store interior: photo-1441986300917-64674bd600d8
- Shopping: photo-1556742049-0cfed4f6a45d
- Products: photo-1472851294608-062f824d29cc
- Retail space: photo-1528698827591-e19ccd7bc23d

CREATIVE/AGENCY:
- Creative workspace: photo-1558618666-fcd25c85cd64
- Design team: photo-1552664730-d307ca884978
- Studio: photo-1558403194-611308249627
- Agency office: photo-1497366412874-3415097a27e7

GENERAL/VERSATILE:
- Modern interior: photo-1497366754035-f200968a6e72
- Collaboration: photo-1521737711867-e3b97375f902
- Workspace: photo-1497215728101-856f4ea42174
- People: photo-1529156069898-49953e39b3ac

**PEXELS (Alternative):**
Format: https://images.pexels.com/photos/[PHOTO_ID]/pexels-photo-[PHOTO_ID].jpeg?auto=compress&cs=tinysrgb&w=[WIDTH]

Working photo IDs:
- Office: 3184291, 3184360, 3183197
- Restaurant: 262978, 1581384, 2788792
- Fitness: 1552242, 1552249, 1552252
- Medical: 4173251, 4225880, 4021775
- Retail: 264636, 1884581, 3769747

**PICSUM (Random - Last Resort):**
Format: https://picsum.photos/[WIDTH]/[HEIGHT]?random=[SEED]
Example: https://picsum.photos/1920/1080?random=1

**PLACEHOLDER.COM (Logo):**
Format: https://via.placeholder.com/[WIDTH]x[HEIGHT]/[BG_COLOR]/[TEXT_COLOR]?text=[TEXT]
Example: https://via.placeholder.com/150x50/4F46E5/FFFFFF?text=YourBrand

═══════════════════════════════════════════════════════
LOGO GENERATION
═══════════════════════════════════════════════════════

Generate logo URL using brand colors:
https://via.placeholder.com/200x60/[PRIMARY_COLOR_NO_HASH]/FFFFFF?text=${context.businessName.replace(/\s+/g, '+')}

Example:
- Primary color: #4F46E5 → use 4F46E5 (remove #)
- Business: "Tech Solutions" → use Tech+Solutions
- Result: https://via.placeholder.com/200x60/4F46E5/FFFFFF?text=Tech+Solutions

═══════════════════════════════════════════════════════
GRAPESJS JSON STRUCTURE
═══════════════════════════════════════════════════════

Return a JSON object with this EXACT structure:

{
  "grapesjs": {
    "html": "<body>...</body>",
    "css": "* { box-sizing: border-box; } ...",
    "components": [
      {
        "type": "wrapper",
        "components": [
          // All sections here
        ]
      }
    ],
    "styles": [
      {
        "selectors": ["body"],
        "style": {
          "margin": "0",
          "padding": "0",
          "font-family": "Inter, sans-serif"
        }
      }
    ],
    "assets": [
      {
        "type": "image",
        "src": "https://images.unsplash.com/...",
        "name": "Hero Background"
      }
    ]
  },
  "metadata": {
    "businessName": "${context.businessName}",
    "industry": "${context.industry}",
    "colorScheme": {
      "primary": "#XXXXXX",
      "secondary": "#XXXXXX",
      "accent": "#XXXXXX",
      "background": "#XXXXXX",
      "text": "#XXXXXX"
    },
    "logoUrl": "https://via.placeholder.com/...",
    "sections": ["hero", "about", "services", "gallery", "testimonials", "contact"]
  }
}

═══════════════════════════════════════════════════════
SECTIONS TO CREATE
═══════════════════════════════════════════════════════

1. **HERO SECTION**
   - Full-width background image (1920x1080)
   - Logo at top
   - Headline (8 words max) - based on tagline/vision
   - Subheadline (20 words max) - value proposition
   - Primary CTA button
   - Secondary CTA button
   
   Component structure:
   {
     "type": "section",
     "attributes": { "id": "hero-section" },
     "components": [
       {
         "type": "image",
         "attributes": { "src": "https://images.unsplash.com/photo-XXXXX?w=1920&q=80", "alt": "Hero" },
         "style": { "position": "absolute", "width": "100%", "height": "100%", "object-fit": "cover" }
       },
       {
         "type": "container",
         "components": [
           { "type": "image", "attributes": { "src": "LOGO_URL" } },
           { "type": "text", "tagName": "h1", "content": "Headline" },
           { "type": "text", "tagName": "p", "content": "Subheadline" },
           { "type": "link", "attributes": { "href": "#contact" }, "content": "Get Started" }
         ]
       }
     ],
     "style": {
       "position": "relative",
       "min-height": "600px",
       "background-color": "PRIMARY_COLOR"
     }
   }

2. **ABOUT SECTION**
   - Headline
   - Story (50-70 words) - based on vision
   - Vision statement
   - Mission statement
   - 4 core values
   - Side image

3. **SERVICES SECTION**
   - Headline
   - Subheadline
   - 3-6 service cards with:
     * Icon (emoji: 🚀 💡 ⚡ 🎯 ✨ 🔥)
     * Service name
     * Description (30 words)
     * Benefit
   - Grid layout (3 columns desktop, 1 mobile)

4. **GALLERY SECTION**
   - Headline
   - 6 images in grid
   - Captions
   - Images from Unsplash (600x400)

5. **TESTIMONIALS SECTION**
   - Headline
   - 3 testimonial cards:
     * Quote (30-40 words)
     * Customer name
     * Role
     * 5 stars (★★★★★)
   - Background image (subtle)

6. **CONTACT SECTION**
   - Headline
   - Contact form:
     * Name input
     * Email input
     * Phone input
     * Message textarea
     * Submit button
   - Contact info
   - Business hours
   - Background image

═══════════════════════════════════════════════════════
STYLING REQUIREMENTS
═══════════════════════════════════════════════════════

**Typography:**
- Font: Inter, -apple-system, sans-serif
- H1: 48px, bold
- H2: 36px, bold
- H3: 24px, semibold
- Body: 16px, normal
- Line height: 1.6

**Spacing:**
- Section padding: 80px vertical, 20px horizontal
- Container max-width: 1200px
- Grid gap: 24px
- Card padding: 24px
- Button padding: 15px 30px

**Colors:**
- Use generated color scheme throughout
- Ensure text contrast (WCAG AA: 4.5:1)
- Primary color for headings
- Accent color for CTAs
- Background color for sections

**Effects:**
- Border radius: 12px for cards, 8px for buttons
- Box shadow: 0 4px 6px rgba(0,0,0,0.1)
- Hover: translateY(-4px) + stronger shadow
- Transitions: 0.3s ease

**Responsive:**
css
@media (max-width: 768px) {
  h1 { font-size: 32px; }
  h2 { font-size: 28px; }
  .grid-3 { grid-template-columns: 1fr; }
  section { padding: 40px 15px; }
}


═══════════════════════════════════════════════════════
CONTENT GUIDELINES
═══════════════════════════════════════════════════════

**Tone by Industry:**
- Tech: Innovative, efficient, clear
- Restaurant: Warm, inviting, appetizing
- Fitness: Energetic, motivational, empowering
- Finance: Professional, trustworthy, secure
- Healthcare: Caring, compassionate, reliable
- Retail: Exciting, value-driven, friendly
- Creative: Bold, unique, inspiring
- Luxury: Sophisticated, exclusive, refined

**Writing Style:**
- Use active voice
- Benefit-focused (not feature-focused)
- Specific to THIS brand (use their vision/mission)
- No generic phrases ("innovative solutions", "quality service")
- Action-oriented CTAs
- Customer-centric language

**CTAs by Industry:**
- Tech: "Start Free Trial", "Book Demo", "Get Started"
- Restaurant: "Reserve Table", "View Menu", "Order Now"
- Fitness: "Join Now", "Book Class", "Start Training"
- Finance: "Schedule Consultation", "Get Quote", "Learn More"
- Healthcare: "Book Appointment", "Contact Us", "Learn More"
- Retail: "Shop Now", "Browse Products", "See Collection"

═══════════════════════════════════════════════════════
VALIDATION CHECKLIST
═══════════════════════════════════════════════════════

Before returning, verify:
✓ Color scheme has 5 unique hex colors
✓ Logo URL is valid placeholder.com format
✓ ALL image URLs are from Unsplash/Pexels/Picsum
✓ Image URLs include proper width parameters
✓ All sections have proper GrapesJS structure
✓ CSS includes responsive media queries
✓ Content is specific to business (not generic)
✓ CTAs are industry-appropriate
✓ Text has sufficient contrast with backgrounds
✓ All components have proper styling

═══════════════════════════════════════════════════════
CRITICAL REQUIREMENTS
═══════════════════════════════════════════════════════

1. **WORKING IMAGES ONLY** - Use real Unsplash/Pexels photo IDs
2. **VALID LOGO URL** - Use placeholder.com with brand colors
3. **UNIQUE COLORS** - Generate custom palette, don't copy examples
4. **GRAPESJS FORMAT** - Must be valid GrapesJS JSON
5. **RESPONSIVE** - Must work on mobile, tablet, desktop
6. **NO PLACEHOLDERS** - All content must be real and specific
7. **PROPER STYLING** - All components fully styled inline
8. **BRAND-SPECIFIC** - Content based on vision/mission

Generate the complete website now in valid JSON format.
`;