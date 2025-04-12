import { checkDomainAvailability } from "./domain-checker.js";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Please provide a Vercel API key as a command-line argument");
  process.exit(1);
}

const vercelApiKey = args[0];

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

server.tool("check-domain", { domain: z.string() }, async ({ domain }) => {
  if (!vercelApiKey) {
    return {
      content: [
        {
          type: "text",
          text: "Error: VERCEL_API_TOKEN is not set in environment variables",
        },
      ],
    };
  }

  const result = await checkDomainAvailability(domain, vercelApiKey);

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
