# @rams/mcp-server

An MCP (Model Context Protocol) server that exposes the RAMS library catalog
as tools any MCP-compatible AI client can call directly - Claude Desktop,
Claude Code, and other MCP clients.

## What it exposes

- **search_books** - search by title/author text, department code, and/or semester
- **get_book_details** - full details for a specific book by ID
- **check_availability** - quick copy-count check for a specific book
- **list_departments** - list all departments (useful for the AI to know what to search by)

This talks directly to the same Postgres database as the web app (via
`@rams/database`), so results are always live/current - no separate sync
step or duplicate data store.

## Setup

```bash
cd apps/mcp-server
pnpm install   # or just `pnpm install` from the repo root
pnpm build
```

Make sure `DATABASE_URL` is set in your environment (same value as the web
app uses) before running it.

## Connect it to Claude Desktop

Add this to your Claude Desktop config file
(`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "rams-library": {
      "command": "node",
      "args": ["/absolute/path/to/UTILISE/rams-platform/apps/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://rams_user:rams_password@localhost:5432/rams_db"
      }
    }
  }
}
```

Restart Claude Desktop, and you'll be able to ask things like *"search the
RAMS library for data structures books in CSE"* directly in a normal Claude
conversation - Claude will call these tools to answer using your real
catalog data.

## Development

```bash
pnpm dev   # runs directly via tsx, no build step needed while iterating
```

## Verification note

I installed the real `@modelcontextprotocol/sdk` package (v1.30.0) and wrote
this against its actual, current API (`registerTool`, `StdioServerTransport`)
rather than from memory - the SDK's API has changed across versions, so I
checked the installed type definitions directly rather than guessing. I was
able to confirm this typechecks cleanly against the real SDK; I was not able
to run it end-to-end against a live database or a real Claude Desktop
connection from my environment, so treat your first real run as the final
check, same as everything else built into this project.
