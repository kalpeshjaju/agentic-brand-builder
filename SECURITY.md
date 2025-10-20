# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email security@example.com or create a private security advisory on GitHub.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Security Best Practices

### 1. API Key Management

**NEVER commit API keys to git!**

✅ **DO:**
- Store API keys in `.env` file (already in .gitignore)
- Use environment variables in production
- Rotate keys regularly
- Use different keys for dev/staging/production

❌ **DON'T:**
- Hard-code API keys in source code
- Share API keys in Slack/email
- Commit `.env` files to git
- Use production keys for testing

### 2. Environment Variables

Required environment variables:
```bash
ANTHROPIC_API_KEY=your_key_here  # Required
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929  # Optional
```

### 3. Cost Protection

This project includes built-in cost controls:
- Default budget: 500K tokens (~$1.50)
- Real-time tracking
- Auto-stop at budget limit

Configure in code:
```typescript
const orchestrator = new MasterOrchestrator(
  config,
  apiKey,
  1_000_000  // Custom budget: 1M tokens
);
```

### 4. Data Privacy

**Brand context files may contain sensitive data:**
- Revenue numbers
- Business strategies
- Competitive intelligence
- Customer data

✅ **DO:**
- Review brand context files before committing
- Use generic examples in documentation
- Add sensitive files to `.gitignore`

### 5. Dependency Security

**Automated security checks:**
```bash
npm audit                    # Check all dependencies
npm audit --production       # Check production only
npm audit fix                # Auto-fix vulnerabilities
```

**Current status:**
- Production dependencies: 0 vulnerabilities ✅
- Dev dependencies: 5 moderate (non-blocking)

### 6. Rate Limiting

Built-in protection against API abuse:
- 50 requests per minute (configurable)
- Automatic retry with exponential backoff
- Prevents 429 (rate limit) errors

### 7. Memory Safety

Built-in protections:
- 50MB memory limit
- Automatic compression of old stage data
- Prevents out-of-memory crashes

## Incident Response

If API key is exposed:

1. **Immediately rotate the key:**
   - Go to Anthropic Console
   - Delete exposed key
   - Generate new key
   - Update `.env` file

2. **Check for unauthorized usage:**
   - Review Anthropic Console usage logs
   - Look for unexpected spikes

3. **Update systems:**
   ```bash
   # Update local
   vim .env  # Add new key
   
   # Update production
   # (Platform-specific instructions)
   ```

4. **Verify git history:**
   ```bash
   git log --all --full-history -- .env
   # Should show NO commits
   ```

## Security Checklist

Before deploying:

- [ ] `.env` file is NOT in git
- [ ] API keys are rotated
- [ ] Cost limits configured
- [ ] Rate limiting enabled
- [ ] Dependencies updated (`npm audit`)
- [ ] Tests passing
- [ ] No hardcoded secrets in code

## Contact

For security concerns: [Your contact method]

Last updated: October 20, 2025

