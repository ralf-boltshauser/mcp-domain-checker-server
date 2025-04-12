import { config } from "dotenv";
import { resolve } from "path";
import { checkDomainAvailability } from "./domain-checker.js";

// Get the absolute path to the .env file using process.cwd()
const envPath = resolve(
  "/Users/ralf/Documents/prj/exploration/mcp/servers/mcp-domain-checker-server",
  ".env"
);
config({ path: envPath });

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "Echo",
  version: "1.0.0",
  capabilities: {
    logging: {},
  },
});

// Register logging capability with the underlying server
server.server.registerCapabilities({
  logging: {},
});

server.resource(
  "echo",
  new ResourceTemplate("echo://{message}", { list: undefined }),
  async (uri, { message }) => ({
    contents: [
      {
        uri: uri.href,
        text: `Resource echo: ${message}`,
      },
    ],
  })
);

server.tool("echo", { message: z.string() }, async ({ message }) => {
  // Only log when the tool is actually used
  const vercel_api_token = process.env.VERCEL_API_TOKEN;
  await server.server.sendLoggingMessage({
    level: "info",
    data: `Echo tool used with message: ${message}`,
  });
  return {
    content: [
      { type: "text", text: `Tool echo: ${message} ${vercel_api_token}` },
    ],
  };
});

server.tool("check-domain", { domain: z.string() }, async ({ domain }) => {
  const vercel_api_token = process.env.VERCEL_API_TOKEN;
  if (!vercel_api_token) {
    return {
      content: [
        {
          type: "text",
          text: "Error: VERCEL_API_TOKEN is not set in environment variables",
        },
      ],
    };
  }

  const result = await checkDomainAvailability(domain, vercel_api_token);

  if (result.error) {
    return {
      content: [
        { type: "text", text: `Error checking domain: ${result.error}` },
      ],
    };
  }

  const availabilityText = result.available
    ? `Domain "${result.domain}" is available${result.price ? ` for $${result.price.amount} per ${result.price.period}` : ""}`
    : `Domain "${result.domain}" is not available`;

  return {
    content: [{ type: "text", text: availabilityText }],
  };
});

server.prompt("echo", { message: z.string() }, ({ message }) => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: `Please process this message: ${message}`,
      },
    },
  ],
}));

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
