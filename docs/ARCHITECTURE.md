# Architecture Documentation

## System Overview

The Agentic Brand Builder uses a **6-stage pipeline architecture** with multi-agent orchestration to generate comprehensive brand intelligence documents.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Master Orchestrator                       │
│  - Coordinates all 6 stages                                  │
│  - Enforces quality gates                                    │
│  - Manages overall pipeline flow                            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌───────────────────┐    ┌──────────────────┐
│  Stage            │    │   Context        │
│  Orchestrator     │◄──►│   Manager        │
│                   │    │                  │
│  - Executes       │    │  - Shared state  │
│    agents per     │    │  - Brand context │
│    stage          │    │  - Stage outputs │
│  - Parallel       │    │                  │
│    processing     │    │                  │
└────────┬──────────┘    └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│           Agent Factory                      │
│  - Creates agents by type                   │
│  - Manages agent lifecycle                  │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│              35+ Specialized Agents          │
│                                              │
│  Stage 1: Data Ingestion (8 agents)        │
│  Stage 2: Analysis (8 agents)              │
│  Stage 3: Intelligence (7 agents)          │
│  Stage 4: Content Generation (5 agents)    │
│  Stage 5: QA (5 agents)                    │
│  Stage 6: Production (3 agents)            │
└─────────────────────────────────────────────┘
```

## Core Components

### 1. Master Orchestrator

**Responsibility**: Top-level coordination

**Key Features**:
- Sequential stage execution
- Quality gate enforcement
- Error handling and recovery
- Overall status determination

**Flow**:
```typescript
for each stage:
  1. Execute stage via StageOrchestrator
  2. Check quality gate
  3. Update shared context
  4. Continue or abort based on criticality
```

### 2. Stage Orchestrator

**Responsibility**: Execute agents within a stage

**Key Features**:
- Parallel agent execution (configurable)
- Batch processing
- Progress tracking
- Error aggregation

**Parallelism**:
```typescript
// Execute agents in batches
for (let i = 0; i < agents.length; i += maxParallel) {
  const batch = agents.slice(i, i + maxParallel);
  await Promise.all(batch.map(agent => agent.execute()));
}
```

### 3. Context Manager

**Responsibility**: Shared state management

**Data Stored**:
- Brand context (immutable)
- Stage results (append-only)
- Shared data (mutable)

**Pattern**: Centralized state store

**Benefits**:
- Agents don't need to know about each other
- No data duplication
- Easy to serialize/resume

### 4. Base Agent

**Responsibility**: Common agent behavior

**Features**:
- Retry logic with exponential backoff
- Timeout handling
- Claude API integration
- Context formatting utilities

**Template Method Pattern**:
```typescript
abstract class BaseAgent {
  // Public interface (final)
  async execute(input: AgentInput): Promise<AgentOutput> {
    // Retry logic, timeout, error handling
  }

  // Subclass hook (abstract)
  protected abstract run(input: AgentInput): Promise<Result>;
}
```

### 5. Agent Factory

**Responsibility**: Agent creation and configuration

**Pattern**: Factory pattern

**Benefits**:
- Centralized agent configuration
- Easy to add new agents
- Consistent agent setup

## Data Flow

### Stage-to-Stage Flow

```
Stage 1: Data Ingestion
  ↓ (raw data, competitor analysis, visual audits)
Stage 2: Analysis
  ↓ (customer insights, segmentation, financial models)
Stage 3: Strategic Intelligence
  ↓ (positioning, messaging, roadmap)
Stage 4: Content Generation
  ↓ (46+ markdown documents)
Stage 5: Quality Assurance
  ↓ (validated, consistent documents)
Stage 6: Production
  ↓ (HTML, PDF outputs)
```

### Agent Input/Output

**Input**:
```typescript
{
  context: BrandContext,           // Brand info
  previousStageOutputs: Record,    // All prior outputs
  specificInstructions?: string    // Optional overrides
}
```

**Output**:
```typescript
{
  agentType: AgentType,
  status: 'completed' | 'failed',
  data: unknown,                   // Agent-specific result
  metadata: {
    tokensUsed: number,
    durationMs: number,
    confidence?: number,
    sources?: string[]
  },
  errors?: string[]
}
```

## Quality Gates

### Per-Stage Validation

Each stage has 4 quality criteria:

1. **All agents completed** (required, 3 points)
2. **No errors** (required, 2 points)
3. **Data quality** (optional, 3 points)
4. **Performance** (optional, 2 points)

**Scoring**: `(points earned / 10) * 10`

**Passing**: >= 7.0/10

**Critical Stages**: 1-3 (Data, Analysis, Intelligence)
- Must pass or pipeline aborts

**Non-Critical Stages**: 4-6 (Strategy, Validation, Production)
- Failures logged but pipeline continues

## Concurrency Model

### Parallel Execution

**Stage-level**: Sequential (stages run one after another)

**Agent-level**: Parallel (agents within a stage run concurrently)

**Configuration**:
```typescript
parallelAgents: 5  // Max 5 agents at once
```

**Example with 8 agents**:
```
Batch 1: [Agent 1, 2, 3, 4, 5] → Execute in parallel
Batch 2: [Agent 6, 7, 8]       → Execute in parallel
```

### State Management

**Thread-safe**: No (single-threaded Node.js)

**Coordination**: Not needed (agents don't write to shared state during execution)

**Context Updates**: Sequential (after batch completes)

## Error Handling

### Agent-Level

1. **Timeout**: Each agent has configurable timeout (default: 5min)
2. **Retries**: Exponential backoff (0s, 2s, 4s)
3. **Failure**: Return `AgentOutput` with `status: 'failed'`

### Stage-Level

1. **Aggregate errors** from all agents
2. **Check quality gate**
3. **Abort if critical stage fails**

### Orchestration-Level

1. **Catch all errors**
2. **Determine overall status**: `success | partial | failed`
3. **Return result** (never throw)

## Extension Points

### Adding New Agents

1. **Create agent class** extending `BaseAgent`
2. **Implement `run()` method**
3. **Register in AgentFactory**
4. **Add to stage in StageOrchestrator**

Example:
```typescript
// 1. Create agent
export class MyAgent extends BaseAgent {
  protected async run(input: AgentInput) {
    // ... implementation
  }
}

// 2. Register in factory
case 'my_agent':
  return new MyAgent(config, this.apiKey);

// 3. Add to stage
private getAgentsForStage(stage: Stage): AgentType[] {
  const stageAgents = {
    analysis: ['review_analysis', 'my_agent', ...]
  };
}
```

### Adding New Stages

1. **Define stage** in `Stage` enum
2. **Add quality criteria** in MasterOrchestrator
3. **Define agents** in StageOrchestrator
4. **Update pipeline** order

## Design Patterns Used

1. **Pipeline Pattern**: Sequential stage processing
2. **Factory Pattern**: Agent creation
3. **Template Method**: BaseAgent
4. **Strategy Pattern**: Different agents for different analyses
5. **Centralized State**: ContextManager
6. **Fan-Out/Fan-In**: Parallel agents, aggregated results

## Performance Considerations

### Token Usage

- **Average per agent**: 2,000-8,000 tokens
- **Total per brand**: ~200,000-500,000 tokens
- **Cost**: $3-10 per brand (Claude Sonnet 4.5)

### Time

- **Stage 1-3**: 15-30 minutes (most LLM calls)
- **Stage 4**: 20-40 minutes (document generation)
- **Stage 5**: 5-10 minutes (validation)
- **Stage 6**: 5-10 minutes (HTML/PDF generation)

**Total**: 45-90 minutes per brand

### Optimization Opportunities

1. **Increase parallelism**: `parallelAgents: 10` (faster but more $)
2. **Cache results**: Reuse Stage 1-2 outputs across runs
3. **Smaller model**: Use Haiku for non-strategic agents
4. **Skip stages**: Run only needed stages

## Security Considerations

1. **API Key**: Stored in environment variables only
2. **Input Validation**: Zod schemas for all inputs
3. **File Access**: Restricted to configured directories
4. **Output Sanitization**: Markdown/HTML sanitized before write

## Monitoring & Observability

**Metrics Tracked**:
- Stage duration
- Agent success/failure rates
- Token usage per agent
- Quality gate scores

**Logging**:
- Color-coded console output
- Structured error messages
- Progress indicators (via `ora`)

**Future**:
- Export metrics to JSON
- Dashboard for real-time monitoring
- Agent performance analytics
