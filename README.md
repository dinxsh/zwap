# ZWAP

A swap protocol bridging Solana's speed with Zcash's privacy using [Zorion Bridge](https://zorion.network/).

## Architecture

This is a monorepo built with Turborepo and Bun, containing:

### Apps

- **`apps/web`** - Next.js web application

### Packages

- **`packages/api`** - tRPC API server
- **`packages/db`** - Database layer (Drizzle ORM)
- **`packages/solana`** - Solana program (Anchor) and client code
- **`packages/zcash`** - Zcash integration via Zorion Bridge
- **`packages/config`** - Shared TypeScript configuration

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up environment variables (see `.env.example` files in each package)

3. Start development:
   ```bash
   bun run dev
   ```

## Solana Program

The Solana program is located in `packages/solana/programs/zwap/`. See [packages/solana/README.md](./packages/solana/README.md) for setup instructions.

## Zcash Integration

Zcash integration uses Zorion Bridge to enable:

- Depositing ZEC → receiving zZEC on Solana
- Burning zZEC → withdrawing to Zcash shielded addresses

See [packages/zcash/README.md](./packages/zcash/README.md) for usage examples.

## Resources

- [Zorion Bridge](https://zorion.network/) - Solana ↔ Zcash bridge
- [Anchor Framework](https://www.anchor-lang.com/) - Solana program framework
