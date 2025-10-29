export const websitePrompt = (context: any) => `
You are an elite web designer creating a PREMIUM, MODERN, FUTURISTIC website in GrapesJS format. Think Apple, Tesla, Stripe level design quality.

BUSINESS INFORMATION:
•⁠  ⁠Business Name: ${context.businessName}
•⁠  ⁠Tagline: ${context.tagline}
•⁠  ⁠Vision: ${context.vision}
•⁠  ⁠Mission: ${context.mission}
•⁠  ⁠Industry: ${context.industry}
•⁠  Logo: ${context.logoUrl}

DESIGN PHILOSOPHY:
Create a website that feels like a $50,000 custom design - premium, polished, with attention to every detail.

═══════════════════════════════════════════════════════
COLOR SCHEME - MODERN & SOPHISTICATED
═══════════════════════════════════════════════════════

Generate a PREMIUM color palette based on industry:

TECH/DIGITAL:
•⁠  ⁠Primary: Deep saturated blues (#2563EB, #4F46E5) or purples (#8B5CF6)
•⁠  ⁠Secondary: Cyan (#06B6D4) or electric blue (#0EA5E9)
•⁠  ⁠Accent: Vibrant gradient (blue to purple to pink)
•⁠  ⁠Background: Pure white (#FFFFFF) or dark (#0A0A0A) for dark mode
•⁠  ⁠Text: Deep gray (#111827) or pure white for dark backgrounds

RESTAURANT/FOOD:
•⁠  ⁠Primary: Rich warm tones (#DC2626, #EA580C)
•⁠  ⁠Secondary: Deep amber (#D97706) or gold (#F59E0B)
•⁠  ⁠Accent: Vibrant red-orange gradient
•⁠  ⁠Background: Cream (#FFFBEB) or dark charcoal (#1F2937)
•⁠  ⁠Text: Deep brown (#78350F) or white

FITNESS/WELLNESS:
•⁠  ⁠Primary: Energetic red (#EF4444) or electric blue (#0EA5E9)
•⁠  ⁠Secondary: Bright orange (#F97316) or teal (#14B8A6)
•⁠  ⁠Accent: Bold gradient (red to orange to yellow)
•⁠  ⁠Background: Clean white or dark navy (#0F172A)
•⁠  ⁠Text: Deep gray or white

FINANCE/PROFESSIONAL:
•⁠  ⁠Primary: Trust-building blue (#1E40AF) or forest green (#047857)
•⁠  ⁠Secondary: Professional teal (#0891B2)
•⁠  ⁠Accent: Subtle gold (#F59E0B) for highlights
•⁠  ⁠Background: Light gray (#F9FAFB) or dark slate (#0F172A)
•⁠  ⁠Text: Charcoal (#1F2937) or white

LUXURY/PREMIUM:
•⁠  ⁠Primary: Deep black (#000000) or navy (#1E293B)
•⁠  ⁠Secondary: Rich gold (#D97706) or rose gold (#E11D48)
•⁠  ⁠Accent: Metallic gradient
•⁠  ⁠Background: White (#FFFFFF) or pure black
•⁠  ⁠Text: Black or white with gold accents

Return colors as:
{
  "primary": "#XXXXXX",
  "secondary": "#XXXXXX",
  "accent": "#XXXXXX",
  "background": "#XXXXXX",
  "text": "#XXXXXX",
  "gradient": "linear-gradient(135deg, #XXXXXX 0%, #XXXXXX 100%)"
}

═══════════════════════════════════════════════════════
TYPOGRAPHY - PREMIUM & MODERN
═══════════════════════════════════════════════════════

Font System:
•⁠  ⁠Display (Headings): 'Space Grotesk', 'Inter', 'SF Pro Display', sans-serif
•⁠  ⁠Body: 'Inter', 'SF Pro Text', -apple-system, sans-serif
•⁠  ⁠Accent: 'JetBrains Mono' for technical elements (optional)

Size Scale (Desktop):
•⁠  ⁠Hero H1: 72px (4.5rem), weight 800, line-height 1.1, letter-spacing -0.03em
•⁠  ⁠Section H2: 48px (3rem), weight 700, line-height 1.2, letter-spacing -0.02em
•⁠  ⁠Card H3: 24px (1.5rem), weight 600, line-height 1.3
•⁠  ⁠Body Large: 20px (1.25rem), weight 400, line-height 1.6
•⁠  ⁠Body: 16px (1rem), weight 400, line-height 1.6
•⁠  ⁠Small: 14px (0.875rem), weight 500, line-height 1.5

Mobile Scale:
•⁠  ⁠Hero H1: 40px, weight 800
•⁠  ⁠Section H2: 32px, weight 700
•⁠  ⁠Card H3: 20px, weight 600
•⁠  ⁠Body: 16px, weight 400

Typography Effects:
•⁠  ⁠Gradient text for headlines: background-clip: text, -webkit-text-fill-color: transparent
•⁠  ⁠Slight text shadows for depth on dark backgrounds
•⁠  ⁠Tight letter spacing for headings (-0.02em to -0.03em)

═══════════════════════════════════════════════════════
GLASSMORPHISM & MODERN EFFECTS
═══════════════════════════════════════════════════════

*Glass Cards:*
css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}


*Gradient Overlays:*
css
.gradient-overlay {
  background: linear-gradient(135deg, rgba(primary, 0.9) 0%, rgba(secondary, 0.8) 100%);
}


*Subtle Animations:*
css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 20px rgba(primary, 0.5); }
  50% { box-shadow: 0 0 40px rgba(primary, 0.8); }
}

.animated-card {
  animation: float 6s ease-in-out infinite;
}

.glow-button {
  animation: glow 2s ease-in-out infinite;
}


*Hover Effects:*
css
.premium-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}


═══════════════════════════════════════════════════════
BUTTON STYLES - PREMIUM & INTERACTIVE
═══════════════════════════════════════════════════════

*Primary Button (CTA):*
css
.btn-primary {
  background: linear-gradient(135deg, primary 0%, secondary 100%);
  color: white;
  padding: 16px 40px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  box-shadow: 0 8px 24px rgba(primary, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 40px rgba(primary, 0.6);
}

.btn-primary:hover::before {
  left: 100%;
}


*Secondary Button (Ghost):*
css
.btn-secondary {
  background: transparent;
  color: primary;
  padding: 16px 40px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  border: 2px solid primary;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: primary;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(primary, 0.4);
}


*Icon Button:*
css
.btn-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(primary, 0.1);
  border: 1px solid rgba(primary, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: primary;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 8px 24px rgba(primary, 0.4);
}


═══════════════════════════════════════════════════════
CARD DESIGNS - PREMIUM LAYOUTS
═══════════════════════════════════════════════════════

*Service Card (Elevated):*
html
<div class="service-card">
  <div class="card-icon">
    <span style="font-size: 48px;">🚀</span>
  </div>
  <h3>Service Name</h3>
  <p>Description text goes here with beautiful typography and spacing.</p>
  <div class="card-footer">
    <a href="#" class="card-link">Learn More →</a>
  </div>
</div>

<style>
.service-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,0,0,0.05);
}

.service-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  border-color: primary;
}

.card-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, primary 0%, secondary 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(primary, 0.3);
}

.service-card h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #111827;
}

.service-card p {
  font-size: 16px;
  line-height: 1.6;
  color: #6B7280;
  margin: 0 0 24px 0;
}

.card-link {
  color: primary;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.card-link:hover {
  color: secondary;
  transform: translateX(4px);
}
</style>


*Testimonial Card (Glass):*
html
<div class="testimonial-card">
  <div class="quote-icon">❝</div>
  <p class="testimonial-text">Amazing service! Highly recommend...</p>
  <div class="testimonial-author">
    <div class="author-avatar">JD</div>
    <div>
      <div class="author-name">John Doe</div>
      <div class="author-role">CEO, Company</div>
    </div>
  </div>
  <div class="stars">★★★★★</div>
</div>

<style>
.testimonial-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  position: relative;
}

.quote-icon {
  font-size: 64px;
  color: rgba(primary, 0.3);
  line-height: 1;
  margin-bottom: 16px;
}

.testimonial-text {
  font-size: 18px;
  line-height: 1.7;
  margin-bottom: 24px;
  color: #1F2937;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, primary 0%, secondary 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
}

.stars {
  color: #F59E0B;
  font-size: 20px;
}
</style>


═══════════════════════════════════════════════════════
HERO SECTION - PREMIUM DESIGN
═══════════════════════════════════════════════════════

html
<section id="hero" style="
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, primary 0%, secondary 100%);
">
  <!-- Animated Background -->
  <div style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-XXXXX?w=1920&q=80');
    background-size: cover;
    background-position: center;
    opacity: 0.2;
  "></div>
  
  <!-- Gradient Overlay -->
  <div style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(primary-rgb, 0.95) 0%, rgba(secondary-rgb, 0.9) 100%);
  "></div>
  
  <!-- Content -->
  <div style="
    position: relative;
    z-index: 10;
    max-width: 1200px;
    padding: 40px 20px;
    text-align: center;
  ">
    <!-- Logo -->
    <img src="LOGO_URL" alt="${context.businessName}" style="
      max-width: 200px;
      margin-bottom: 48px;
      filter: brightness(0) invert(1);
    ">
    
    <!-- Headline with Gradient Text -->
    <h1 style="
      font-size: 72px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin: 0 0 24px 0;
      color: white;
      text-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">
      Premium Headline Here
    </h1>
    
    <!-- Subheadline -->
    <p style="
      font-size: 24px;
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto 48px auto;
      color: rgba(255,255,255,0.9);
    ">
      Compelling subheadline that explains the value proposition clearly.
    </p>
    
    <!-- CTA Buttons -->
    <div style="
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    ">
      <a href="#contact" style="
        display: inline-block;
        padding: 18px 48px;
        background: white;
        color: primary;
        border-radius: 12px;
        font-weight: 700;
        font-size: 18px;
        text-decoration: none;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      ">
        Get Started →
      </a>
      
      <a href="#about" style="
        display: inline-block;
        padding: 18px 48px;
        background: rgba(255,255,255,0.1);
        color: white;
        border: 2px solid white;
        border-radius: 12px;
        font-weight: 700;
        font-size: 18px;
        text-decoration: none;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      ">
        Learn More
      </a>
    </div>
  </div>
  
  <!-- Scroll Indicator -->
  <div style="
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    animation: bounce 2s infinite;
  ">
    <div style="
      width: 30px;
      height: 50px;
      border: 2px solid white;
      border-radius: 20px;
      display: flex;
      justify-content: center;
      padding-top: 8px;
    ">
      <div style="
        width: 4px;
        height: 10px;
        background: white;
        border-radius: 2px;
      "></div>
    </div>
  </div>
</section>

<style>
@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}
</style>


═══════════════════════════════════════════════════════
SECTION LAYOUTS - PREMIUM SPACING
═══════════════════════════════════════════════════════

*Standard Section:*
css
section {
  padding: 120px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  section {
    padding: 60px 20px;
  }
}


*Section Header:*
html
<div class="section-header" style="
  text-align: center;
  max-width: 800px;
  margin: 0 auto 80px auto;
">
  <h2 style="
    font-size: 48px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin: 0 0 24px 0;
    background: linear-gradient(135deg, primary 0%, secondary 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  ">
    Section Title
  </h2>
  <p style="
    font-size: 20px;
    line-height: 1.6;
    color: #6B7280;
  ">
    Descriptive subheadline that provides context.
  </p>
</div>


*Grid Layouts:*
css
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .grid-3 { grid-template-columns: 1fr; }
}


═══════════════════════════════════════════════════════
IMAGE SOURCES (HIGH QUALITY)
═══════════════════════════════════════════════════════

Use Unsplash with these parameters for premium quality:
•⁠  ⁠Resolution: ?w=1920&q=90 (hero), ?w=800&q=85 (cards)
•⁠  ⁠Auto format: &auto=format&fit=crop

Working photo IDs by category:

TECH/MODERN:
•⁠  ⁠photo-1497366216548-37526070297c (office)
•⁠  ⁠photo-1522071820081-009f0129c71c (team)
•⁠  ⁠photo-1498050108023-c5249f4df085 (tech)
•⁠  ⁠photo-1551434678-e076c223a692 (workspace)

BUSINESS/PROFESSIONAL:
•⁠  ⁠photo-1454165804606-c3d57bc86b40 (desk)
•⁠  ⁠photo-1497366811353-6870744d04b2 (meeting)
•⁠  ⁠photo-1460925895917-afdab827c52f (data)

RESTAURANT/FOOD:
•⁠  ⁠photo-1517248135467-4c7edcad34c4 (restaurant)
•⁠  ⁠photo-1414235077428-338989a2e8c0 (fine dining)
•⁠  ⁠photo-1504674900247-0877df9cc836 (food)

FITNESS:
•⁠  ⁠photo-1534438327276-14e5300c3a48 (gym)
•⁠  ⁠photo-1571019614242-c5c5dee9f50b (class)
•⁠  ⁠photo-1571902943202-507ec2618e8f (workout)

═══════════════════════════════════════════════════════
FINAL STRUCTURE
═══════════════════════════════════════════════════════

Return JSON with:

{
  "grapesjs": {
    "html": "COMPLETE HTML WITH INLINE STYLES",
    "css": "GLOBAL CSS WITH ANIMATIONS",
    "components": [...],
    "styles": [...]
  },
  "metadata": {
    "businessName": "${context.businessName}",
    "industry": "${context.industry}",
    "colorScheme": {
      "primary": "#XXXXXX",
      "secondary": "#XXXXXX",
      "accent": "#XXXXXX",
      "background": "#XXXXXX",
      "text": "#XXXXXX",
      "gradient": "linear-gradient(...)"
    },
    "typography": {
      "display": "Space Grotesk, Inter, sans-serif",
      "body": "Inter, sans-serif"
    }
  }
}

CRITICAL REQUIREMENTS:
✅ Premium glassmorphism effects
✅ Smooth animations and transitions
✅ Gradient text for headlines
✅ Interactive hover states
✅ Modern button designs with shine effects
✅ Proper typography hierarchy
✅ High-quality Unsplash images
✅ Responsive design
✅ Brand-specific content (not generic)
✅ Professional spacing and layout

Generate the PREMIUM website now.
`;