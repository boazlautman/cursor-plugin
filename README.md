# AgentGuard — AI Security for Cursor

Protect Cursor's AI agent from **prompt injection**, **PII leaks**, and **RAG poisoning** by scanning MCP tool responses in real time before they reach the LLM.

## Setup

1. Create a free account at [agentguard.dev](https://agentguard.dev) and copy your **Shield ID**.
2. Install this plugin from the [Cursor Marketplace](https://cursor.com/marketplace).
3. In Cursor Settings → MCP, set the `AGENTGUARD_SHIELD_ID` environment variable to your Shield ID.

That's it — every MCP tool response in Cursor is now scanned automatically.

## What it does

- **`scan_tool_response`** — Call this tool after any MCP tool execution to scan the result for indirect prompt injection before it reaches the LLM.
- **`scan_chunks`** — Call this tool on RAG-retrieved document chunks to filter poisoned content before building the LLM context.

## Included

| Component | Description |
|-----------|-------------|
| MCP Server | `agentguard-mcp` npm package — scans tool responses via the AgentGuard API |
| Rules | Always-on secure agent development guidelines |
| Skill | `/scan-agent` — analyze your agent code for security vulnerabilities |
