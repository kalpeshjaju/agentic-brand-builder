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
Create a comprehensive implementation roadmap for this brand's growth strategy.

## Roadmap Planning Framework

### 1. Strategic Phases

**Phase Structure**:
- Phase 0: Foundation (0-3 months)
- Phase 1: Launch (3-6 months)
- Phase 2: Growth (6-12 months)
- Phase 3: Scale (12-18 months)
- Phase 4: Optimization (18-24 months)

**Per Phase**:
- Objectives
- Key initiatives
- Success criteria
- Resource needs
- Budget allocation

### 2. Timeline & Milestones

**Timeline Planning**:
- Start/end dates for each phase
- Key milestones
- Decision points
- Review cycles
- Adjustment triggers

**Milestone Types**:
- Product milestones
- Marketing milestones
- Revenue milestones
- Team milestones
- System milestones

### 3. Quick Wins

**Criteria**:
- High impact, low effort
- Can be completed in <90 days
- Build momentum
- Validate assumptions
- Generate early results

**Quick Win Categories**:
- Revenue generation
- Cost reduction
- Process improvement
- Customer acquisition
- Brand visibility

### 4. Dependencies

**Dependency Mapping**:
- What depends on what?
- Critical path identification
- Parallel vs sequential tasks
- Blocking dependencies
- Optional dependencies

**Dependency Types**:
- Technical dependencies
- Resource dependencies
- External dependencies
- Data dependencies
- Team dependencies

### 5. Resource Planning

**Resource Types**:
- Team (roles and headcount)
- Budget (by phase and category)
- Technology (tools and platforms)
- Partnerships (external support)
- Time (effort estimates)

**Resource Allocation**:
- Current resources available
- Additional resources needed
- Hiring timeline
- Training requirements
- Contractor vs full-time

### 6. Risk Mitigation Timeline

**Risk Planning**:
- When to address each risk
- Preventive measures
- Contingency plans
- Monitoring triggers
- Response protocols

**Risk Categories**:
- Market risks
- Execution risks
- Resource risks
- Technical risks
- Financial risks

### 7. Success Metrics

**Per-Phase Metrics**:
- Input metrics (activities)
- Output metrics (results)
- Outcome metrics (business impact)
- Leading indicators
- Lagging indicators

**Measurement Cadence**:
- Daily dashboards
- Weekly reviews
- Monthly reports
- Quarterly assessments
- Annual planning

### 8. Governance & Reviews

**Review Structure**:
- Weekly: Team standups
- Bi-weekly: Initiative reviews
- Monthly: Phase reviews
- Quarterly: Strategic reviews
- Annual: Planning cycles

**Decision Framework**:
- Who decides what?
- Escalation paths
- Approval processes
- Change management
- Communication plans

# Output Format
Provide structured JSON:
{
  "phases": [
    {
      "phaseNumber": 0,
      "phaseName": "Foundation",
      "duration": "3 months",
      "startMonth": 1,
      "endMonth": 3,
      "objectives": [
        "Establish brand foundation",
        "Build minimum viable product",
        "Set up operations"
      ],
      "keyInitiatives": [
        {
          "initiative": "Brand Identity Development",
          "owner": "Brand Lead",
          "duration": "6 weeks",
          "dependencies": [],
          "budget": 500000,
          "resources": ["Designer", "Copywriter"]
        }
      ],
      "milestones": [
        {
          "milestone": "Brand guidelines complete",
          "targetDate": "Month 2",
          "criteria": ["Logo finalized", "Colors approved", "Voice defined"]
        }
      ],
      "successCriteria": {
        "mustHave": ["Brand identity complete", "MVP launched"],
        "targets": {
          "brandAwareness": "5%",
          "firstCustomers": 100,
          "revenueGenerated": 500000
        }
      },
      "risks": [
        {
          "risk": "Delays in brand approval",
          "impact": "medium",
          "mitigation": "Start with iterative reviews",
          "owner": "Project Manager"
        }
      ]
    },
    {
      "phaseNumber": 1,
      "phaseName": "Launch",
      "duration": "3 months",
      "startMonth": 4,
      "endMonth": 6,
      "objectives": ["Market entry", "Customer acquisition", "Revenue generation"]
    }
  ],
  "quickWins": [
    {
      "initiative": "Social media presence",
      "impact": "high",
      "effort": "low",
      "timeline": "2 weeks",
      "expectedOutcome": "Build audience of 5K followers",
      "resources": ["Social media manager"],
      "budget": 50000
    }
  ],
  "dependencies": {
    "criticalPath": [
      "Brand identity → Website → Marketing campaigns → Launch"
    ],
    "dependencyMap": [
      {
        "task": "Marketing campaigns",
        "dependsOn": ["Brand identity", "Website", "Product photography"],
        "type": "blocking",
        "impact": "Cannot launch without these"
      }
    ]
  },
  "resourcePlan": {
    "teamPlan": {
      "phase0": {
        "roles": [
          { "role": "Brand Lead", "count": 1, "type": "full-time" },
          { "role": "Designer", "count": 2, "type": "contractor" }
        ],
        "totalHeadcount": 3,
        "monthlyCost": 400000
      }
    },
    "budgetAllocation": {
      "phase0": {
        "brandDevelopment": 500000,
        "productDevelopment": 1000000,
        "marketing": 300000,
        "operations": 200000,
        "total": 2000000
      }
    },
    "technologyNeeds": [
      {
        "tool": "Website platform",
        "purpose": "E-commerce",
        "timing": "Month 1",
        "cost": 100000
      }
    ]
  },
  "riskTimeline": [
    {
      "month": 2,
      "risks": ["Brand approval delays"],
      "mitigation": ["Start iterative reviews early"],
      "owner": "Project Manager",
      "status": "monitoring"
    }
  ],
  "successMetrics": {
    "phase0": {
      "inputMetrics": {
        "brandReviewSessions": 10,
        "designIterations": 5,
        "customerInterviews": 50
      },
      "outputMetrics": {
        "brandGuidelinesComplete": true,
        "mvpLaunched": true,
        "teamHired": 5
      },
      "outcomeMetrics": {
        "brandAwareness": "5%",
        "customerAcquisition": 100,
        "revenue": 500000
      }
    }
  },
  "governance": {
    "weeklyStandups": {
      "day": "Monday",
      "duration": "30 min",
      "attendees": ["Core team"],
      "agenda": ["Progress", "Blockers", "Plans"]
    },
    "monthlyReviews": {
      "format": "Phase review",
      "attendees": ["Leadership", "Key stakeholders"],
      "decisions": ["Go/no-go", "Resource allocation", "Priority changes"]
    },
    "decisionFramework": {
      "tactical": "Team leads",
      "strategic": "Leadership",
      "financial": "CFO approval >500K"
    }
  },
  "confidence": 0.80
}`;

    const response = await this.callClaude(systemPrompt, userPrompt, {
      maxTokens: 12000
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
