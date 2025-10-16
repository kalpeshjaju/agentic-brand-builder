import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Brand Narrative Agent
 *
 * Crafts compelling brand story and narratives:
 * - Origin story and brand heritage
 * - Mission, vision, and values
 * - Brand personality and voice
 * - Customer success stories
 * - Founder story (if applicable)
 * - Future vision and aspirations
 *
 * Outputs structured narrative content for storytelling
 */
export class BrandNarrativeAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a brand storytelling expert. Your role is to:
1. Craft compelling brand origin stories
2. Articulate brand mission, vision, and values
3. Develop brand personality and voice
4. Create customer success narratives
5. Build emotional connections through storytelling
6. Ensure narrative consistency and authenticity

Return structured, emotionally resonant brand narratives.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Develop a comprehensive brand narrative that brings this brand to life through storytelling.

## Brand Narrative Framework

### 1. Origin Story
The founding story - why and how the brand came to be:

**Story Elements**:
- **The Problem**: What problem did founders see?
- **The Insight**: What realization sparked the idea?
- **The Journey**: How did they start?
- **The Struggle**: What challenges did they face?
- **The Breakthrough**: What changed everything?
- **The Mission**: What drives them today?

**Narrative Structure**:
- Beginning: The world before
- Middle: The founding journey
- End: Where we are now (and going)

**Tone**: Authentic, inspiring, human

### 2. Mission, Vision & Values

**Mission** (What we do):
- Clear statement of purpose
- Who we serve
- What we deliver
- Why it matters

**Vision** (Where we're going):
- Aspirational future state
- Impact we want to have
- World we want to create
- 5-10 year ambition

**Values** (How we operate):
- 3-5 core values
- Each with definition
- Behavioral examples
- Non-negotiables

### 3. Brand Personality

**Personality Dimensions**:
- **Sincerity**: Honest, genuine, cheerful
- **Excitement**: Daring, spirited, imaginative
- **Competence**: Reliable, intelligent, successful
- **Sophistication**: Glamorous, charming, refined
- **Ruggedness**: Tough, outdoorsy, resilient

**Brand Archetype**:
Choose primary archetype:
- The Hero, The Outlaw, The Magician
- The Regular Guy, The Lover, The Jester
- The Caregiver, The Creator, The Ruler
- The Sage, The Innocent, The Explorer

**Character Traits**:
If the brand were a person:
- Age and stage of life
- Personality characteristics
- Speaking style
- Interests and passions
- Quirks and uniqueness

### 4. Customer Stories
Real or representative customer narratives:

**Story Arc**:
- **Before**: Customer's initial situation/problem
- **Discovery**: How they found the brand
- **Experience**: What happened
- **Transformation**: How life improved
- **Advocacy**: Why they recommend it

**Story Types**:
- Success stories
- Transformation journeys
- Community impact
- Against-the-odds wins

### 5. Founder Story (if applicable)
Personal journey of the founder(s):

**Elements**:
- Background and expertise
- What led to founding
- Personal motivation
- Vision for the future
- Leadership philosophy

### 6. Future Vision
Where the brand is heading:

**Future Narrative**:
- What we're building
- Problems we'll solve
- Impact we'll have
- Innovations coming
- Legacy we'll leave

### 7. Narrative Themes
Recurring themes across all stories:

**Theme Examples**:
- Empowerment
- Innovation
- Sustainability
- Community
- Excellence
- Accessibility

## Storytelling Principles

**Authenticity**: Stories must be true and genuine
**Emotion**: Connect on emotional level
**Conflict**: Every good story has tension
**Resolution**: Show the positive outcome
**Relatability**: Audience should see themselves
**Consistency**: All narratives align

# Output Format
Provide structured JSON:
{
  "originStory": {
    "theProblem": "Customers couldn't find quality products at fair prices",
    "theInsight": "Quality and affordability aren't mutually exclusive",
    "theJourney": "Started in a garage with a simple mission...",
    "theStruggle": "Big brands dismissed us, retailers wouldn't stock us",
    "theBreakthrough": "Customers voted with their wallets - word of mouth exploded",
    "theMission": "Make quality accessible to everyone",
    "fullStory": "[3-paragraph narrative version]"
  },
  "missionVisionValues": {
    "mission": "To deliver exceptional quality at prices everyone can afford",
    "vision": "A world where quality is accessible to all, not just the privileged few",
    "values": [
      {
        "value": "Quality First",
        "definition": "Never compromise on product quality",
        "behaviors": ["Source best materials", "Rigorous testing"]
      },
      {
        "value": "Fair Pricing",
        "definition": "Price fairly, not to maximize profits",
        "behaviors": ["Transparent pricing", "No artificial markups"]
      }
    ]
  },
  "brandPersonality": {
    "primaryDimension": "Competence",
    "secondaryDimension": "Sincerity",
    "archetype": "The Regular Guy",
    "characterTraits": {
      "age": "30s - established but not stuffy",
      "personality": ["Reliable", "Approachable", "Honest", "Smart"],
      "speakingStyle": "Clear, friendly, no jargon",
      "interests": ["Quality craftsmanship", "Fair trade", "Community"]
    }
  },
  "customerStories": [
    {
      "title": "How Priya Found Her Perfect Fit",
      "type": "transformation",
      "before": "Frustrated with poor quality at her price range",
      "discovery": "Friend recommended after seeing results",
      "experience": "First purchase exceeded expectations",
      "transformation": "Now a loyal customer, saved money",
      "advocacy": "Recommended to 10+ friends",
      "fullStory": "[2-3 paragraph narrative]"
    }
  ],
  "founderStory": {
    "name": "Founder Name",
    "background": "20 years in the industry",
    "motivation": "Saw friends struggle to afford quality",
    "vision": "Quality shouldn't be a luxury",
    "philosophy": "Success measured by customer satisfaction, not just profits",
    "fullStory": "[2-3 paragraph narrative]"
  },
  "futureVision": {
    "building": "A trusted brand that puts customers first",
    "solving": "The quality-price gap in our category",
    "impact": "Make quality accessible to 10M+ customers",
    "innovations": "New sustainable materials, AI-powered personalization",
    "legacy": "Changed industry pricing standards",
    "narrative": "[2 paragraph vision story]"
  },
  "narrativeThemes": [
    {
      "theme": "Empowerment",
      "description": "Everyone deserves quality",
      "howItShows": "Accessible pricing, education, community"
    }
  ],
  "confidence": 0.80
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
        // Fallback: create basic brand narrative structure
        data = {
          originStory: {
            theProblem: 'To be developed',
            theInsight: 'To be developed',
            theJourney: 'To be developed',
            theMission: 'To be developed',
            fullStory: 'Brand story to be crafted based on founding details'
          },
          missionVisionValues: {
            mission: 'To be defined',
            vision: 'To be defined',
            values: []
          },
          brandPersonality: {
            archetype: 'To be determined',
            characterTraits: {}
          },
          customerStories: [],
          founderStory: {
            fullStory: 'Founder story to be developed'
          },
          futureVision: {
            narrative: 'Future vision to be crafted'
          },
          narrativeThemes: [],
          confidence: 0.65,
          note: 'Basic narrative framework - needs brand history and founding details'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.75,
        sources: ['brand_narrative']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse brand narrative response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
