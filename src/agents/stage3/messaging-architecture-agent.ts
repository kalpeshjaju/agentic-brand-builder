import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Messaging Architecture Agent
 *
 * Creates comprehensive brand messaging framework:
 * - Core brand messages and value propositions
 * - Messaging hierarchy (from brand to product level)
 * - Tone of voice guidelines
 * - Message tailoring by segment and channel
 * - Key proof points and supporting evidence
 *
 * Outputs structured messaging that connects strategy to execution
 */
export class MessagingArchitectureAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a strategic brand messaging expert. Your role is to:
1. Develop a comprehensive messaging architecture
2. Create clear value propositions for each segment
3. Define tone of voice and brand personality
4. Build messaging hierarchy from brand to product level
5. Tailor messages for different channels and contexts
6. Provide proof points and supporting evidence

Return structured, actionable messaging framework.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Develop a comprehensive messaging architecture for this brand.

## Messaging Framework

### 1. Core Brand Message
The single, unifying idea that defines the brand:
- **Brand Essence**: One-sentence core message
- **Brand Promise**: What we commit to customers
- **Brand Purpose**: Why we exist beyond profit
- **Brand Personality**: Key character traits (5-7 adjectives)

### 2. Value Proposition Pyramid

**Brand Level** (For all customers):
- **Headline**: Compelling 10-word statement
- **Sub-headline**: 20-word explanation
- **Three Key Benefits**: Core reasons to choose us
- **Proof Points**: Evidence supporting claims

**Segment Level** (For each customer segment):
- Tailored value proposition
- Specific benefits that matter to this segment
- Relevant proof points
- Addressing segment-specific pains

**Product Level** (For each product/service):
- Product-specific messaging
- Feature-benefit translation
- Use case scenarios
- Differentiation from competitors

### 3. Messaging Pillars
3-5 key themes that support the brand message:

For each pillar:
- **Theme**: The main idea
- **Message**: How we talk about it
- **Benefits**: Why it matters to customers
- **Proof Points**: Evidence and examples
- **Stories**: Narratives that bring it to life

### 4. Tone of Voice Guidelines

**Voice Characteristics**:
- Describe the brand voice (e.g., "Confident but approachable")
- What we are vs. what we're not
- Emotional range (from serious to playful)

**Communication Principles**:
- How we structure messages
- Language we use and avoid
- Cultural sensitivities
- Brand vocabulary (preferred terms)

### 5. Channel-Specific Messaging

Adapt core messages for different contexts:
- **Website**: Detailed, persuasive
- **Social Media**: Conversational, engaging
- **Advertising**: Attention-grabbing, memorable
- **Sales Collateral**: Professional, evidence-based
- **Customer Service**: Empathetic, helpful

### 6. Message Testing Framework

For each key message, provide:
- **Clarity Score**: Is it easy to understand? (1-10)
- **Relevance Score**: Does it matter to target audience? (1-10)
- **Differentiation Score**: Does it stand out? (1-10)
- **Credibility Score**: Is it believable? (1-10)
- **Memorability Score**: Will people remember it? (1-10)

# Output Format
Provide structured JSON:
{
  "coreBrandMessage": {
    "brandEssence": "One-sentence core message",
    "brandPromise": "What we commit to",
    "brandPurpose": "Why we exist",
    "brandPersonality": ["Innovative", "Trustworthy", "Accessible", "Bold", "Empathetic"]
  },
  "valueProposition": {
    "brandLevel": {
      "headline": "10-word compelling statement",
      "subheadline": "20-word explanation",
      "keyBenefits": [
        "Benefit 1",
        "Benefit 2",
        "Benefit 3"
      ],
      "proofPoints": [
        "Proof 1",
        "Proof 2"
      ]
    },
    "segmentLevel": [
      {
        "segmentId": "segment-1",
        "segmentName": "Budget-Conscious Millennials",
        "valueProposition": "Tailored value prop",
        "specificBenefits": ["Benefit 1", "Benefit 2"],
        "proofPoints": ["Proof 1"]
      }
    ],
    "productLevel": [
      {
        "productName": "Product A",
        "messaging": "Product-specific message",
        "keyFeatures": ["Feature 1", "Feature 2"],
        "benefits": ["Benefit 1", "Benefit 2"]
      }
    ]
  },
  "messagingPillars": [
    {
      "theme": "Quality Without Compromise",
      "message": "We deliver premium quality at fair prices",
      "benefits": ["Benefit 1", "Benefit 2"],
      "proofPoints": ["Proof 1", "Proof 2"],
      "stories": ["Story 1"]
    }
  ],
  "toneOfVoice": {
    "voiceCharacteristics": {
      "description": "Confident but approachable",
      "weAre": ["Clear", "Helpful", "Honest"],
      "weAreNot": ["Pretentious", "Overly technical", "Salesy"],
      "emotionalRange": "Warm and encouraging"
    },
    "communicationPrinciples": [
      "Always lead with customer benefits",
      "Use simple, jargon-free language",
      "Be specific with claims and proof"
    ],
    "brandVocabulary": {
      "preferred": ["Quality", "Value", "Smart choice"],
      "avoid": ["Cheap", "Budget", "Discount"]
    }
  },
  "channelMessaging": {
    "website": {
      "approach": "Detailed and persuasive",
      "keyMessages": ["Message 1", "Message 2"]
    },
    "socialMedia": {
      "approach": "Conversational and engaging",
      "keyMessages": ["Message 1", "Message 2"]
    }
  },
  "messageValidation": {
    "primaryMessage": {
      "message": "The main brand message",
      "clarityScore": 9,
      "relevanceScore": 8,
      "differentiationScore": 7,
      "credibilityScore": 8,
      "memorabilityScore": 7,
      "overallScore": 7.8
    }
  },
  "confidence": 0.85
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
        // Fallback: create basic messaging architecture result
        data = {
          coreBrandMessage: {
            brandEssence: 'To be determined',
            brandPromise: 'To be determined',
            brandPurpose: 'To be determined',
            brandPersonality: ['Professional', 'Trustworthy', 'Accessible']
          },
          valueProposition: {
            brandLevel: {
              headline: 'To be determined',
              subheadline: 'To be determined',
              keyBenefits: []
            }
          },
          messagingPillars: [],
          toneOfVoice: {
            voiceCharacteristics: {
              description: 'To be determined'
            }
          },
          confidence: 0.6,
          note: 'Partial messaging architecture - more strategic input needed'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.8,
        sources: ['messaging_architecture']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse messaging architecture response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
