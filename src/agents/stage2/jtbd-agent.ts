import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Jobs-to-be-Done (JTBD) Agent
 *
 * Analyzes customer jobs, pains, and gains using the JTBD framework:
 * - Functional jobs: Tasks customers need to accomplish
 * - Emotional jobs: How customers want to feel
 * - Social jobs: How customers want to be perceived
 * - Pain points: Obstacles and frustrations
 * - Gains: Desired outcomes and benefits
 *
 * Outputs structured JTBD analysis for each segment
 */
export class JtbdAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a Jobs-to-be-Done (JTBD) expert. Your role is to:
1. Identify the jobs customers are trying to accomplish
2. Understand functional, emotional, and social dimensions
3. Map pain points and obstacles
4. Identify desired gains and outcomes
5. Prioritize jobs by importance and satisfaction gap
6. Connect jobs to customer segments

Return structured, actionable JTBD analysis.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Conduct a comprehensive Jobs-to-be-Done analysis for this brand's customers.

## JTBD Framework

### 1. Job Identification
For each customer segment, identify:

**Functional Jobs**: Practical tasks to accomplish
- What tasks are customers trying to complete?
- What problems are they trying to solve?
- What needs are they trying to satisfy?

**Emotional Jobs**: Feelings and states
- How do customers want to feel?
- What emotions do they seek?
- What do they want to avoid feeling?

**Social Jobs**: Perception and status
- How do customers want to be perceived?
- What image do they want to project?
- What social needs do they have?

### 2. Pains Analysis
Identify obstacles, frustrations, and risks:
- **Functional Pains**: Things that don't work well
- **Emotional Pains**: Negative feelings
- **Social Pains**: Negative perceptions
- **Ancillary Pains**: Side effects and hassles

Rate each pain:
- **Extreme**: Deal-breaker, must be solved
- **Severe**: Very annoying, high priority
- **Moderate**: Annoying but tolerable
- **Minor**: Slight inconvenience

### 3. Gains Analysis
Identify desired outcomes and benefits:
- **Required Gains**: Must-haves for the solution to work
- **Expected Gains**: Standard features customers expect
- **Desired Gains**: Nice-to-haves that delight
- **Unexpected Gains**: Surprise benefits that wow

Rate each gain:
- **Essential**: Required for adoption
- **Nice-to-have**: Adds value but not critical
- **Differentiator**: Could set you apart

### 4. Job Prioritization
For each job, assess:
- **Importance**: How important is this job to customers? (1-10)
- **Satisfaction**: How satisfied are they with current solutions? (1-10)
- **Opportunity Score**: (Importance + max(Importance - Satisfaction, 0))

### 5. Insights & Implications
- Which jobs are most underserved (high importance, low satisfaction)?
- Where are the biggest opportunities?
- How do jobs connect to segments?
- What are the strategic priorities?

# Output Format
Provide structured JSON:
{
  "jobsAnalysis": [
    {
      "segmentId": "segment-1",
      "segmentName": "Budget-Conscious Millennials",
      "jobs": {
        "functional": [
          {
            "job": "Find affordable quality products quickly",
            "importance": 9,
            "currentSatisfaction": 5,
            "opportunityScore": 13
          }
        ],
        "emotional": [
          {
            "job": "Feel smart about purchase decisions",
            "importance": 8,
            "currentSatisfaction": 6,
            "opportunityScore": 10
          }
        ],
        "social": [
          {
            "job": "Be seen as savvy shopper",
            "importance": 6,
            "currentSatisfaction": 7,
            "opportunityScore": 6
          }
        ]
      },
      "pains": [
        {
          "pain": "High prices of premium brands",
          "severity": "severe",
          "type": "functional",
          "currentIntensity": 8
        },
        {
          "pain": "Worry about product quality at low prices",
          "severity": "moderate",
          "type": "emotional",
          "currentIntensity": 6
        }
      ],
      "gains": [
        {
          "gain": "Save money without sacrificing quality",
          "category": "required",
          "value": "essential"
        },
        {
          "gain": "Fast delivery at low cost",
          "category": "expected",
          "value": "nice-to-have"
        },
        {
          "gain": "Exclusive deals for loyal customers",
          "category": "desired",
          "value": "differentiator"
        }
      ]
    }
    // ... more segments
  ],
  "keyInsights": {
    "topUnderservedJobs": [
      {
        "job": "Find affordable quality products quickly",
        "opportunityScore": 13,
        "segment": "segment-1"
      }
    ],
    "criticalPains": [
      "High prices of premium brands",
      "Difficulty verifying product quality"
    ],
    "mustHaveGains": [
      "Save money without sacrificing quality",
      "Easy returns and refunds"
    ],
    "strategicOpportunities": [
      "Focus on transparent quality indicators at mid-tier prices",
      "Build trust through reviews and guarantees",
      "Simplify product discovery and comparison"
    ]
  },
  "confidence": 0.85
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 8000
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
        // Fallback: create basic JTBD result
        data = {
          jobsAnalysis: [
            {
              segmentId: 'segment-1',
              segmentName: 'Primary Segment',
              jobs: {
                functional: [
                  {
                    job: 'To be determined',
                    importance: 7,
                    currentSatisfaction: 5,
                    opportunityScore: 9
                  }
                ]
              },
              pains: [],
              gains: []
            }
          ],
          keyInsights: {
            topUnderservedJobs: [],
            criticalPains: [],
            mustHaveGains: []
          },
          confidence: 0.6,
          note: 'Partial JTBD analysis - more customer research needed'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.8,
        sources: ['jtbd_analysis']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse JTBD response: ${(error as Error).message}. ` +
        'This may indicate malformed JSON from the LLM.'
      );
    }
  }
}
