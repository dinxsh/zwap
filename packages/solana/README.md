# @zwap/solana

Solana program package for ZWAP.

## Structure

- `programs/zwap/` - Rust Solana program (Anchor framework)
- `src/` - TypeScript client code for interacting with the program
- `Anchor.toml` - Anchor configuration file

## Setup

1. Install Anchor CLI: https://www.anchor-lang.com/docs/installation
2. Install Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools
3. Install dependencies: `bun install`

## Development

- Build program: `bun run build`
- Run tests: `bun run test`
- Deploy: `bun run deploy`
- Start local validator: `bun run localnet`

## Program ID

The program ID is defined in `programs/zwap/src/lib.rs` and `Anchor.toml`. 
For a new program, generate a new keypair and update both files.

## Integration with Zcash

This package works alongside `@zwap/zcash` which uses [Zorion Bridge](https://zorion.network/) to enable:
- Depositing ZEC → receiving zZEC (SPL token) on Solana
- Burning zZEC → withdrawing to Zcash shielded addresses

The Solana program can interact with zZEC tokens minted by Zorion Bridge.

