import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * HTML Generator Agent
 *
 * Converts strategic documents into polished, interactive HTML:
 * - Responsive HTML layout
 * - Professional styling
 * - Interactive navigation
 * - Data visualizations
 * - Print-friendly format
 * - SEO optimization
 *
 * Outputs production-ready HTML with embedded CSS
 */
export class HtmlGeneratorAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are an expert HTML/CSS developer specializing in document presentation. Your role is to:
1. Convert markdown content into semantic, accessible HTML
2. Create beautiful, responsive designs
3. Implement professional styling with CSS
4. Build intuitive navigation
5. Ensure print compatibility
6. Optimize for performance and SEO

Return complete, production-ready HTML.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Generate a complete, production-ready HTML document from the strategic content.

## HTML Requirements

### 1. Document Structure
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Brand Name] - Brand Strategy</title>
  <meta name="description" content="Comprehensive brand strategy document">

  <!-- Embedded CSS -->
  <style>
    /* Your CSS here */
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav>
    <!-- Table of contents with anchor links -->
  </nav>

  <!-- Main Content -->
  <main>
    <!-- Document sections -->
  </main>

  <!-- Footer -->
  <footer>
    <!-- Metadata and branding -->
  </footer>
</body>
</html>
\`\`\`

### 2. Navigation Component
- Sticky/fixed sidebar navigation
- Smooth scroll to sections
- Active section highlighting
- Collapsible on mobile

### 3. Content Sections
For each section:
- Clear typography hierarchy (h1, h2, h3)
- Readable body text (18px, good line-height)
- Proper spacing and whitespace
- Responsive images/charts
- Data tables with styling
- Pull quotes for key insights

### 4. Design System

**Colors**:
- Primary: Professional brand color
- Secondary: Complementary accent
- Background: Clean white/light gray
- Text: Dark gray for readability
- Highlights: For important callouts

**Typography**:
- Headings: Sans-serif, bold, hierarchy
- Body: Serif or sans-serif, 18px, 1.6 line-height
- Code/Data: Monospace for technical content

**Components**:
- Info boxes for key insights
- Warning/attention boxes for risks
- Success boxes for opportunities
- Data tables with zebra striping
- Cards for personas/segments

### 5. Responsive Design
- Mobile: Single column, hamburger nav
- Tablet: Adjusted spacing
- Desktop: Sidebar nav, wider content
- Print: Clean, paginated format

### 6. Interactive Features
- Smooth scrolling
- Section highlighting on scroll
- Expandable sections (optional)
- Print button/stylesheet
- Back to top button

### 7. Print Optimization
\`\`\`css
@media print {
  /* Hide navigation */
  /* Adjust colors for print */
  /* Page breaks */
  /* Footer on each page */
}
\`\`\`

## Example HTML Structure
\`\`\`html
<section id="executive-summary" class="content-section">
  <h1>Executive Summary</h1>

  <div class="insight-box">
    <h3>🎯 The Opportunity</h3>
    <p>Key insight about market opportunity...</p>
  </div>

  <h2>Key Insights</h2>
  <ul class="key-insights">
    <li><strong>Insight 1:</strong> Description...</li>
  </ul>
</section>
\`\`\`

# Output Format
Provide structured JSON with HTML content:
{
  "html": {
    "filename": "brand-strategy-[brand-name].html",
    "content": "<!DOCTYPE html>\\n<html>\\n...[complete HTML]...</html>",
    "cssVariables": {
      "primaryColor": "#2c3e50",
      "secondaryColor": "#3498db",
      "backgroundColor": "#ffffff",
      "textColor": "#333333"
    },
    "metadata": {
      "title": "Brand Strategy: [Brand Name]",
      "description": "Comprehensive brand strategy document",
      "fileSize": "45KB",
      "sections": 6
    }
  },
  "assets": {
    "customCSS": "/* Additional custom CSS if needed */",
    "javascript": "/* Optional JS for interactivity */"
  },
  "confidence": 0.90
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 12000
    });

    try {
      // Parse response
      const content = response.content.trim();
      let data: unknown;

      // Try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create basic HTML structure
        const basicHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.context.brandName} - Brand Strategy</title>
  <style>
    body { font-family: sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; }
  </style>
</head>
<body>
  <h1>${input.context.brandName} Brand Strategy</h1>
  <p>Document generated. Full content to be added.</p>
</body>
</html>`;

        data = {
          html: {
            filename: `brand-strategy-${input.context.brandName.toLowerCase().replace(/\\s+/g, '-')}.html`,
            content: basicHtml,
            cssVariables: {
              primaryColor: '#2c3e50',
              textColor: '#333333'
            },
            metadata: {
              title: `Brand Strategy: ${input.context.brandName}`,
              fileSize: '2KB',
              sections: 1
            }
          },
          confidence: 0.6,
          note: 'Basic HTML structure - full styling needs document content'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.85,
        sources: ['html_generator']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse HTML generator response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
