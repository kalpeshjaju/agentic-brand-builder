# Description

<!-- Provide a brief description of what this PR does -->

## Type of Change

<!-- Mark relevant option with 'x' -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 🤖 New agent implementation
- [ ] 🧪 Test coverage improvement
- [ ] 📚 Documentation update
- [ ] 🔨 Refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] 🔧 Chore (build, dependencies, etc.)

## What Changed

<!-- Detailed description of changes -->

### Before
<!-- What was the behavior/state before? -->

### After
<!-- What is the behavior/state now? -->

## Agent Implementation (if applicable)

<!-- If implementing a new agent, fill this out -->

**Agent Name**: [e.g., PDF Extraction Agent]
**Stage**: [e.g., Stage 1]
**Functionality**: [Brief description]

**Agent Checklist**:
- [ ] Extends BaseAgent
- [ ] Implements run() method
- [ ] System and user prompts defined
- [ ] Response parsing implemented
- [ ] Error handling added
- [ ] Registered in AgentFactory
- [ ] Added to StageOrchestrator

## Testing

<!-- How was this tested? -->

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing locally

### How to Test
1. Step 1
2. Step 2
3. Expected result

## Quality Checks

<!-- All must pass before merge -->

- [ ] ✅ Type-check passes (`npm run type-check`)
- [ ] ✅ Lint passes (`npm run lint`)
- [ ] ✅ Tests pass (`npm test`)
- [ ] ✅ Build succeeds (`npm run build`)
- [ ] ✅ Health check passes (`npm run health-check`)

## Documentation

- [ ] README.md updated (if applicable)
- [ ] ROADMAP.md updated (if agent implemented)
- [ ] Code comments added for complex logic
- [ ] API documentation updated (if applicable)

## Breaking Changes

<!-- List any breaking changes, or state "None" -->

- None

## Related Issues

<!-- Link related issues -->

Closes #[issue number]
Related to #[issue number]

## Checklist

<!-- Final checklist before requesting review -->

- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented complex areas of my code
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Additional Context

<!-- Any additional information that reviewers should know -->

---

**For Reviewers**: Please check:
- [ ] Code quality and style
- [ ] Test coverage adequate
- [ ] Documentation complete
- [ ] No obvious bugs or issues
