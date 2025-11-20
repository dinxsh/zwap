# @zwap/zcash

Zcash integration package for ZWAP using [Zorion Bridge](https://zorion.network/).

Zorion bridges Solana's high-throughput ecosystem to Zcash's battle-tested shielded pool, allowing seamless movement of value between the two chains.

## Features

- **ZEC → zZEC**: Deposit ZEC and receive zZEC (SPL token) on Solana
- **zZEC → ZEC**: Burn zZEC on Solana and withdraw to Zcash Unified Address (shielded by default)
- **Selective Disclosure**: Optional viewing keys for compliance
- **Fast & Secure**: Threshold-secured federation with proof-of-reserves

## Setup

1. Install dependencies: `bun install`

## Development

- Build: `bun run build`
- Type check: `bun run check-types`

## Usage

### Initialize the Client

```typescript
import { ZcashClient } from "@zwap/zcash";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet-beta.solana.com");
const zcashClient = new ZcashClient({ connection });
```

### Deposit ZEC → Receive zZEC on Solana

```typescript
const userSolanaAddress = new PublicKey("<USER_SOL_ADDRESS>");
const { zcashDepositAddress } = await zcashClient.getDepositAddress(
  userSolanaAddress
);

console.log("Send ZEC here:", zcashDepositAddress);
// After confirmations, zZEC will be automatically minted to userSolanaAddress
```

### Withdraw zZEC → Receive ZEC to Shielded Address

```typescript
await zcashClient.withdraw({
  from: userSolanaAddress,
  amount: "1.25", // ZEC amount as string
  zcashAddress: "u1q9...shielded", // Unified Address
  viewingKey: "<OPTIONAL_VIEWING_KEY>", // Optional for selective disclosure
});
```

## How It Works

Zorion uses a bidirectional bridge:

- **Deposits**: Users send ZEC to a unique deposit address. After confirmations, Zorion mints zZEC 1:1 to the user's Solana wallet.
- **Withdrawals**: Users burn zZEC on Solana. Zorion sends native ZEC to the specified Unified Address (shielded by default).

## Architecture

- **MVP**: Threshold-secured federation observes deposits/burns and posts signed attestations
- **Phase 2**: ZK proof verification for trust-minimized bridging

## Resources

- [Zorion Documentation](https://zorion.network/)
- [Zorion Bridge SDK](https://www.npmjs.com/package/@zorion/bridge-sdk)
