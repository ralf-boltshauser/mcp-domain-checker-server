# MCP Domain Checker Server

A ModelContextProtocol server that provides domain availability checking functionality. This server allows you to check if a domain is available for registration and get its price information using the Vercel API.

## Features

- Check domain availability
- Get domain pricing information
- Automatic TLD handling (defaults to .com if not specified)
- Error handling and detailed response format

## Quick Start

1. Install dependencies:
```bash
pnpm install
```

2. Set up your environment:
```bash
cp .env.example .env
```
Then add your Vercel API token to the `.env` file.

3. Build and run:
```bash
pnpm run build
pnpm start
```

## Development

For development with hot-reloading:
```bash
pnpm run dev
```

## License

MIT License - see [LICENSE](LICENSE) for details. 