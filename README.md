# AgentGuard — AI Security for Cursor & VS Code

Protect your AI agent from **prompt injection**, **PII leaks**, and **RAG poisoning** by scanning MCP tool responses before they reach the LLM.

## Why you need this

AI agents that browse the web, read files, or query APIs are vulnerable to **prompt injection** — hidden instructions embedded in external content that silently hijack the agent's behavior. A malicious web page can instruct your agent to exfiltrate data, ignore your instructions, or take destructive actions.

AgentGuard scans every tool response before it reaches the LLM and blocks attacks in real time, with sub-15ms latency.

**What's included:**

| Component | What it does |
|-----------|-------------|
| `scan_tool_response` tool | Scans web, file, and API responses for prompt injection and PII leaks |
| `scan_chunks` tool | Filters poisoned RAG document chunks before they enter your prompt |
| Security rules | Always-on guidelines instructing the agent to scan before using external content |
| Copilot instructions | `.github/copilot-instructions.md` — tells GitHub Copilot to scan automatically |
| `/scan-agent` skill | Audits your agent code for security vulnerabilities on demand |

## What to realistically expect

The scanning tools are available to the AI agent and it is instructed to use them via the included rules and Copilot instructions. In most cases the agent will call `scan_tool_response` automatically after fetching external content.

However, this is guidance-based — not a hard firewall. **For guaranteed enforcement in production**, integrate the [AgentGuard SDK](https://botguard.dev) directly into your agent code.

## Setup

1. Create a free account at [botguard.dev](https://botguard.dev)
2. Go to **Dashboard → Shields** and copy your Shield ID — it looks like `sh_xxxxxxxxxxxxxxxx`
3. Install this plugin from the Cursor Marketplace, or add manually to `.vscode/mcp.json` / `mcp.json`:

```json
{
  "mcpServers": {
    "agentguard": {
      "command": "npx",
      "args": ["-y", "agentguard-mcp"],
      "env": {
        "AGENTGUARD_SHIELD_ID": "sh_xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

4. Restart Cursor / VS Code

> The Shield ID is just the `sh_...` part — not the full URL.

## Works with

- Cursor (via Cursor Marketplace)
- VS Code + GitHub Copilot (via `@mcp` in Extensions)
- Claude Desktop
- Windsurf

## SDK for production use

For guaranteed scanning in your own agent code:

```typescript
import { BotGuard } from 'botguard';
const guard = new BotGuard({ shieldId: process.env.AGENTGUARD_SHIELD_ID });
const result = await guard.scanToolResponse(toolOutput, { toolName: 'web_search' });
if (result.blocked) throw new Error('Injection blocked: ' + result.reason);
```

Get started at [botguard.dev](https://botguard.dev)
