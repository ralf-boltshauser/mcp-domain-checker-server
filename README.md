# DomainGenius MCP Server

The DomainGenius MCP server powers the domain search functionality of [DomainGenius](https://domaingenius.ch/), providing real-time domain availability checks and pricing information.

## Features

- Real-time domain availability checking
- Domain pricing information retrieval
- Automatic TLD handling (defaults to .com if not specified)
- Error handling and detailed response format
- Seamless integration with AI-powered domain search tools

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