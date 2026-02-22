#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const AGENTGUARD_API_URL = (process.env.AGENTGUARD_API_URL || 'https://agentguard-api-8ae872ce8db9.herokuapp.com').replace(/\/$/, '');
const SHIELD_ID = process.env.AGENTGUARD_SHIELD_ID || '';

if (!SHIELD_ID) {
  process.stderr.write('AgentGuard MCP: AGENTGUARD_SHIELD_ID environment variable is required\n');
  process.exit(1);
}

const server = new McpServer({
  name: 'agentguard',
  version: '1.0.0',
});

server.tool(
  'scan_tool_response',
  'Scan an MCP tool response for indirect prompt injection attacks and PII before passing it to the LLM. Returns the safe response or blocks it if a threat is detected.',
  {
    toolResponse: z.string().describe('The raw text content returned by a tool that needs to be scanned'),
    toolName: z.string().optional().describe('Optional name of the tool that produced this response'),
  },
  async ({ toolResponse, toolName }) => {
    const url = `${AGENTGUARD_API_URL}/api/mcp/proxy/${SHIELD_ID}`;
    let resp: Response;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolResponse, toolName }),
        signal: AbortSignal.timeout(15000),
      });
    } catch (err) {
      return {
        content: [{ type: 'text', text: `AgentGuard scan error: ${(err as Error).message}` }],
        isError: true,
      };
    }

    if (!resp.ok) {
      const body = await resp.text();
      return {
        content: [{ type: 'text', text: `AgentGuard API error (${resp.status}): ${body}` }],
        isError: true,
      };
    }

    const result = await resp.json() as {
      blocked: boolean;
      reason?: string;
      confidence: number;
      safeResponse: string | null;
      toolName: string | null;
    };

    if (result.blocked) {
      return {
        content: [{
          type: 'text',
          text: `[BLOCKED by AgentGuard] ${result.reason || 'Potential prompt injection detected'}. Confidence: ${Math.round(result.confidence * 100)}%`,
        }],
        isError: true,
      };
    }

    return {
      content: [{
        type: 'text',
        text: result.safeResponse ?? toolResponse,
      }],
    };
  },
);

server.tool(
  'scan_chunks',
  'Scan RAG-retrieved document chunks for poisoning attacks before building the LLM prompt context. Returns only the clean, safe chunks.',
  {
    chunks: z.array(z.string()).describe('Array of document chunk strings retrieved from a vector database or document store'),
  },
  async ({ chunks }) => {
    const url = `${AGENTGUARD_API_URL}/api/rag/proxy/${SHIELD_ID}`;
    let resp: Response;
    try {
      resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chunks }),
        signal: AbortSignal.timeout(15000),
      });
    } catch (err) {
      return {
        content: [{ type: 'text', text: `AgentGuard scan error: ${(err as Error).message}` }],
        isError: true,
      };
    }

    if (!resp.ok) {
      const body = await resp.text();
      return {
        content: [{ type: 'text', text: `AgentGuard API error (${resp.status}): ${body}` }],
        isError: true,
      };
    }

    const result = await resp.json() as {
      cleanChunks: string[];
      blockedCount: number;
      totalCount: number;
    };

    const summary = result.blockedCount > 0
      ? `[AgentGuard] Blocked ${result.blockedCount} of ${result.totalCount} chunks. Safe chunks below:\n\n`
      : '';

    return {
      content: [{
        type: 'text',
        text: summary + result.cleanChunks.join('\n\n---\n\n'),
      }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('AgentGuard MCP server running\n');
}

main().catch((err) => {
  process.stderr.write(`AgentGuard MCP fatal error: ${err.message}\n`);
  process.exit(1);
});
