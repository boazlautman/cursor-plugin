---
name: scan-agent
description: Analyze the current agent, MCP server, or LLM application code for security vulnerabilities using AgentGuard's security checklist. Invoke with /scan-agent.
---

# scan-agent Skill

## What this skill does

When invoked, this skill performs a comprehensive security review of the AI agent code in the current file or workspace against AgentGuard's security checklist.

## Instructions

When the user invokes `/scan-agent`, do the following:

1. Read the relevant agent/LLM application code from the current file or referenced files.

2. Evaluate it against each item in the checklist below, marking each as PASS, FAIL, or N/A.

3. For each FAIL, explain the specific risk and provide a concrete code fix using the AgentGuard SDK.

4. Provide an overall security score (0–100) and a recommended next step.

## Security Checklist

### MCP Tool Response Safety
- [ ] All MCP tool responses are scanned with `guard.scanToolResponse()` or the `scan_tool_response` MCP tool before being passed to the LLM
- [ ] Tool scan results check `result.blocked` before using `result.safeResponse`
- [ ] Error handling exists if the scan API is unavailable (fail-safe behavior)

### RAG Pipeline Safety
- [ ] Retrieved document chunks are scanned with `guard.scanChunks()` before prompt injection
- [ ] Only `cleanChunks` from the scan result are used in the LLM context
- [ ] Blocked chunk count is logged or monitored

### LLM Input/Output Scanning
- [ ] Chat completions route through the AgentGuard gateway or `guard.chat.completions.create()`
- [ ] Output is checked for `result.blocked` before being returned to users
- [ ] PII guardrails are enabled on the shield for outputs

### Secrets & Configuration
- [ ] `shieldId` and API keys are read from environment variables, not hardcoded
- [ ] No credentials appear in prompts or tool descriptions
- [ ] `.env` files are in `.gitignore`

### Tool Definitions
- [ ] Tool descriptions don't instruct the agent to execute arbitrary code or access sensitive paths
- [ ] File system tools are scoped to necessary directories only
- [ ] Network tools have domain allow-listing where possible

### CI/CD
- [ ] Certification check is part of the deployment pipeline
- [ ] Security score threshold is enforced before production deployment

## Output Format

```
## AgentGuard Security Scan

**File:** <filename>
**Overall Score:** XX/100

### Results

| Check | Status | Notes |
|-------|--------|-------|
| MCP tool response scanning | FAIL | `web_search` result passed directly to LLM on line 42 |
| RAG chunk scanning | PASS | |
| ... | ... | ... |

### Critical Issues

**1. Unscanned tool response (line 42)**
Risk: Web search results can contain injected instructions that hijack the agent.
Fix:
\`\`\`typescript
const result = await guard.scanToolResponse(searchResult, { toolName: 'web_search' });
if (result.blocked) throw new Error('Blocked: ' + result.reason);
const safe = result.safeResponse;
\`\`\`

### Next Steps
1. ...
```
