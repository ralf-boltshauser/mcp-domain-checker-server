import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from "express";
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

// STDIO

// async function main() {
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
// }

// main();

// SSE

const app = express();

// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports: { [sessionId: string]: SSEServerTransport } = {};

// app.get("/sse", async (_: Request, res: Response) => {
//   const transport = new SSEServerTransport("/messages", res);
//   transports[transport.sessionId] = transport;
//   res.on("close", () => {
//     delete transports[transport.sessionId];
//   });
//   await server.connect(transport);
// });
app.get("/sse", async (_: Request, res: Response) => {
  res.send("Hello from SSE");
});

app.get("/test", async (_: Request, res: Response) => {
  res.send("Hello from SSE");
});

app.get("/", async (_: Request, res: Response) => {
  res.send("Hello, world!");
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

app.listen(3001, "0.0.0.0");
