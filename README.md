# MCP TypeScript Server Starter

A starter project for building Model Context Protocol (MCP) servers in TypeScript. This project provides a simple echo server implementation that demonstrates the core features of MCP.

## Features

- Simple echo server implementation
- Support for tools, resources, and prompts
- TypeScript support
- Development server with hot reloading
- Built-in inspector for testing and debugging

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ralf-boltshauser/mcp-typescript-server-starter.git
cd mcp-typescript-server-starter

# Install dependencies
pnpm install
```

### Development

Start the development server with hot reloading:

```bash
pnpm dev
```

This will:
1. Start the TypeScript compiler in watch mode
2. Launch the MCP inspector

The inspector will be available at: http://127.0.0.1:6274

## Project Structure

- `src/index.ts` - Main server implementation using the high-level MCP API
- `src/low-level-index.ts` - Alternative implementation using the low-level API
- `dist/` - Compiled output directory

## Server Features

### Echo Tool
A simple tool that echoes back the input message:
```typescript
server.tool("echo", { message: z.string() }, async ({ message }) => ({
  content: [{ type: "text", text: `Tool echo: ${message}` }],
}));
```

### Echo Resource
A resource that can be accessed via URI:
```typescript
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
```

### Echo Prompt
A prompt template for processing messages:
```typescript
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
```

## Implementation Options

This project provides two implementation approaches:

1. **High-level API** (`src/index.ts`)
   - Easier to use
   - More concise code
   - Good for most use cases

2. **Low-level API** (`src/low-level-index.ts`)
   - More control over implementation
   - More verbose but flexible
   - Better for advanced use cases

## Using the Inspector

The MCP inspector (available at http://127.0.0.1:6274) allows you to:
- Test tools
- Browse resources
- View available prompts
- Monitor server activity

## Building for Production

```bash
pnpm build
```

This will create an executable in the `dist` directory.

## Configuring in Cursor

To use this server in Cursor, add the following configuration to your Cursor settings:

```json
{
  "mcpServers": {
    "Echo Server": {
      "command": "node",
      "args": [
        "/path/to/echo-server/dist/index.cjs"
      ]
    }
  }
}
```

Make sure to:
1. Run `pnpm build` first to create the executable
2. Replace `/path/to/echo-server` with the actual path to your project directory

## Configuring in Claude Desktop

To use this server in Claude Desktop, run the following command:

```bash
echo '{
  "mcpServers": {
    "echo-server": {
      "command": "node",
      "args": ["'$PWD'/dist/index.cjs"]
    }
  }
}' > ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

⚠️ **Important Note**: This configuration will overwrite all existing MCP tools in Claude Desktop. Use with caution.

To verify the setup:
1. Restart Claude Desktop
2. Check if the hammer tool (🛠️) appears in the chat window, showing the available tools

## License

[MIT](LICENSE) 