import { BaseAgent } from '../base-agent.js';
import type { AgentInput } from '../../types/index.js';

/**
 * Roadmap Planning Agent
 *
 * Creates implementation timeline and resource planning:
 * - Phase-by-phase implementation plan
 * - Resource allocation and requirements
 * - Dependencies and critical path
 * - Risk mitigation timeline
 * - Quick wins identification
 * - Success metrics per phase
 * - Timeline estimation
 *
 * Outputs structured roadmap with milestones
 */
export class RoadmapPlanningAgent extends BaseAgent {
  protected async run(input: AgentInput): Promise<{
    data: unknown;
    tokensUsed?: number;
    confidence?: number;
    sources?: string[];
  }> {
    const brandContext = this.formatBrandContext(input);
    const previousOutputs = this.formatPreviousOutputs(input);

    const systemPrompt = `You are a strategic roadmap planning expert. Your role is to:
1. Create phased implementation plans
2. Identify dependencies and critical paths
3. Allocate resources effectively
4. Plan risk mitigation
5. Define success metrics
6. Identify quick wins

Return structured, actionable roadmaps with realistic timelines.`;

    const userPrompt = `${brandContext}

${previousOutputs}

# Task
Create implementation roadmap for this brand's growth strategy.

## Required Components

### 1. Strategic Phases (4-5 phases over 18-24 months)
For each phase: objectives, key initiatives, milestones, success criteria, resources, budget.

### 2. Quick Wins (<90 days)
High impact, low effort initiatives. Include: initiative, timeline, outcome, resources, budget.

### 3. Dependencies & Critical Path
Map what depends on what. Identify blocking dependencies and critical path.

### 4. Resource Plan
- Team plan: roles, headcount, timing, cost by phase
- Budget allocation: by phase and category
- Technology needs: tools, timing, cost

### 5. Risk Mitigation Timeline
When to address each risk, preventive measures, contingencies by phase.

### 6. Success Metrics
Per-phase metrics: input (activities), output (deliverables), outcome (business impact).

### 7. Governance
Review cadence (weekly/monthly/quarterly), decision framework.

# Output Format
Return JSON:
{
  "phases": [
    {
      "phaseNumber": 0,
      "phaseName": "Foundation",
      "duration": "3 months",
      "startMonth": 1,
      "endMonth": 3,
      "objectives": ["List objectives"],
      "keyInitiatives": [
        {
          "initiative": "Name",
          "owner": "Role",
          "duration": "X weeks",
          "dependencies": [],
          "budget": 500000,
          "resources": ["Role1", "Role2"]
        }
      ],
      "milestones": [{ "milestone": "Name", "targetDate": "Month X", "criteria": [] }],
      "successCriteria": { "mustHave": [], "targets": {} }
    }
  ],
  "quickWins": [
    {
      "initiative": "Name",
      "impact": "high",
      "effort": "low",
      "timeline": "X weeks",
      "expectedOutcome": "Result",
      "budget": 50000
    }
  ],
  "dependencies": {
    "criticalPath": ["A → B → C"],
    "dependencyMap": [{ "task": "X", "dependsOn": ["Y"], "type": "blocking" }]
  },
  "resourcePlan": {
    "teamPlan": {
      "phase0": { "roles": [{ "role": "Name", "count": 1, "type": "full-time" }], "totalHeadcount": 3, "monthlyCost": 400000 }
    },
    "budgetAllocation": {
      "phase0": { "marketing": 500000, "product": 1000000, "total": 2000000 }
    }
  },
  "successMetrics": {
    "phase0": {
      "inputMetrics": {},
      "outputMetrics": {},
      "outcomeMetrics": { "revenue": 500000 }
    }
  },
  "governance": {
    "weeklyStandups": { "day": "Monday", "duration": "30 min" },
    "decisionFramework": { "tactical": "Team leads", "strategic": "Leadership" }
  },
  "confidence": 0.80
}

Focus on realistic timelines and resource constraints.`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 6000
    });

    try {
      const content = response.content.trim();
      let data: unknown;

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        data = {
          phases: [
            {
              phaseNumber: 0,
              phaseName: 'Foundation',
              duration: '3 months',
              objectives: [],
              keyInitiatives: [],
              milestones: []
            }
          ],
          quickWins: [],
          dependencies: {
            criticalPath: [],
            dependencyMap: []
          },
          resourcePlan: {
            teamPlan: {},
            budgetAllocation: {}
          },
          riskTimeline: [],
          successMetrics: {},
          governance: {},
          confidence: 0.70,
          note: 'Basic roadmap framework - needs detailed strategy inputs'
        };
      }

      const typedData = data as { confidence?: number };

      return {
        data,
        tokensUsed: response.tokensUsed,
        confidence: typedData.confidence || 0.75,
        sources: ['roadmap_planning']
      };
    } catch (error) {
      throw new Error(
        `Failed to parse roadmap planning response: ${(error as Error).message}`
      );
    }
  }
}
