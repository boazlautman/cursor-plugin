# AgentGuard — AI Security for Cursor & VS Code

Protect your AI agent from **prompt injection**, **PII leaks**, and **RAG poisoning** by scanning MCP tool responses before they reach the LLM.

## What it does

When an AI agent (Cursor, GitHub Copilot, Claude) fetches data from the web, files, or APIs, that content can contain hidden instructions designed to hijack the agent. AgentGuard scans tool responses and blocks attacks before they cause damage.

**Included tools:**
- `scan_tool_response` — scan any MCP tool output for prompt injection and PII
- `scan_chunks` — scan RAG document chunks for poisoning before building the LLM context

**Included rules:**
- Always-on security guidelines for building safe AI agents (`rules/ai-agent-security.mdc`)
- Copilot instructions that tell the agent to scan tool responses automatically (`.github/copilot-instructions.md`)

**Included skill:**
- `/scan-agent` — audit your agent code for security vulnerabilities

## What to realistically expect

The scanning tools are available to the AI agent and it is instructed to use them via the included rules and Copilot instructions. In most cases the agent will call `scan_tool_response` automatically after fetching external content.

However, this is guidance-based — not a hard firewall. **For guaranteed enforcement in production**, integrate the [AgentGuard SDK](https://botguard.dev) directly into your agent code.

## Setup

1. Create a free account and get your **Shield ID** at [botguard.dev](https://botguard.dev)
2. Install this plugin from the Cursor Marketplace, or add to `.vscode/mcp.json` / `mcp.json`:

```json
{
  "mcpServers": {
    "agentguard": {
      "command": "npx",
      "args": ["-y", "agentguard-mcp"],
      "env": {
        "AGENTGUARD_SHIELD_ID": "sh_your_shield_id_here"
      }
    }
  }
}
```

3. Restart Cursor / VS Code

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
