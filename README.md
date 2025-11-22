# ZWAP - Solana to Zcash Bridge

A privacy-focused bridge that allows users to deposit SOL or USDC on Solana and receive ZEC to their shielded Zcash address.

## Architecture

- **Frontend**: Next.js app with Solana wallet integration
- **Backend API**: tRPC endpoints for deposit management
- **Solana Program**: Anchor program handling deposits and events
- **Relayer**: Service monitoring Solana deposits and sending ZEC
- **Zcash Integration**: RPC client for zcashd operations
- **Database**: PostgreSQL with Drizzle ORM

## Prerequisites

- Node.js 18+ (using Bun runtime)
- Rust and Solana CLI tools (for program development)
- PostgreSQL database
- Zcash full node (zcashd) with RPC access
- Solana wallet with devnet SOL

## Project Structure

```
zwap/
├── apps/
│   └── web/              # Next.js frontend
├── packages/
│   ├── api/              # tRPC backend API
│   │   └── services/     # Relayer and conversion services
│   ├── db/               # Database schema and migrations
│   ├── solana/           # Solana program and client SDK
│   │   └── programs/zwap/ # Anchor program
│   └── zcash/            # Zcash RPC client
└── doc.md                # Detailed specification
```

## Setup

### 1. Install Dependencies

```bash
# Install all dependencies
bun install

# Install Solana program dependencies
cd packages/solana
cargo build-sbf
```

### 2. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Copy environment variables
cp .env.example .env

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://zwap:zwap_dev_password@localhost:5432/zwap

# Generate and run migrations
cd packages/db
bun run db:generate
bun run db:push
```

### 3. Zcash Node Setup

You need a running zcashd node with RPC access:

```bash
# Example zcash.conf
rpcuser=your_rpc_username
rpcpassword=your_rpc_password
rpcallowip=127.0.0.1
rpcport=8232
testnet=1

# Create a shielded address for the relayer
zcash-cli z_getnewaddress
```

Update `.env` with Zcash credentials:
```
ZCASH_RPC_URL=http://localhost:8232
ZCASH_RPC_USER=your_rpc_username
ZCASH_RPC_PASSWORD=your_rpc_password
RELAYER_Z_ADDRESS=your_shielded_z_address
```

### 4. Deploy Solana Program

```bash
cd packages/solana

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Update ZWAP_PROGRAM_ID in .env with deployed program ID
```

### 5. Configure Environment

Update `.env` with all required variables:

```bash
# Database
DATABASE_URL=postgresql://zwap:zwap_dev_password@localhost:5432/zwap

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
ZWAP_PROGRAM_ID=<your_deployed_program_id>

# Zcash
ZCASH_RPC_URL=http://localhost:8232
ZCASH_RPC_USER=your_rpc_username
ZCASH_RPC_PASSWORD=your_rpc_password
RELAYER_Z_ADDRESS=<your_relayer_z_address>

# Frontend
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_ZWAP_PROGRAM_ID=<your_deployed_program_id>
```

## Running the Application

### Development Mode

```bash
# Terminal 1: Start the relayer
cd packages/api
bun run src/scripts/start-relayer.ts

# Terminal 2: Start the frontend
cd apps/web
bun run dev
```

### Production Mode

```bash
# Build all packages
bun run build

# Start services
npm run start
```

## User Flow

1. **Connect Wallet**: User connects Solana wallet to the frontend
2. **Enter Details**: User selects SOL/USDC, amount, and provides Zcash shielded address
3. **Create Deposit**: Frontend calls backend to create deposit record
4. **Sign Transaction**: User signs Solana transaction
5. **Confirm on Solana**: Transaction is confirmed on Solana blockchain
6. **Relayer Detects**: Relayer monitors program logs and detects deposit event
7. **Send ZEC**: Relayer sends equivalent ZEC to user's shielded address
8. **Status Updates**: User can track status on the status page

## API Endpoints

### tRPC Routes

- `deposit.startDeposit` - Create a new deposit
- `deposit.getStatus` - Get deposit status by ID
- `deposit.getBySignature` - Get deposit by Solana transaction signature
- `deposit.updateSolanaTx` - Update deposit with Solana transaction

## Solana Program Instructions

- `initialize` - Initialize the vault (one-time setup)
- `deposit_sol` - Deposit SOL to vault
- `deposit_usdc` - Deposit USDC to vault

## Zcash Integration

The relayer uses zcashd RPC methods:
- `z_sendmany` - Send ZEC to shielded addresses
- `z_getoperationstatus` - Check async operation status
- `z_getoperationresult` - Get operation results

## Security Considerations

⚠️ **Important Security Notes**:

1. **Centralized Relayer**: This is a demo with a single relayer holding ZEC funds
2. **No Atomic Swaps**: Transactions happen separately on each chain
3. **Trust Required**: Users must trust the relayer to send ZEC
4. **Environment Variables**: Never commit `.env` files with real credentials
5. **Testnet Only**: Use testnet/devnet for development and testing

## Development

### Run Tests

```bash
# Run all tests
bun test

# Test specific package
cd packages/solana
bun test
```

### Lint and Format

```bash
# Lint
bun run lint

# Format
bun run format
```

### Database Migrations

```bash
cd packages/db

# Generate migration
bun run db:generate

# Apply migration
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

## Troubleshooting

### Relayer not detecting deposits
- Check Solana RPC connection
- Verify program ID matches deployed program
- Ensure relayer has proper database access

### ZEC not being sent
- Verify zcashd is running and synced
- Check relayer Z-address has sufficient balance
- Verify RPC credentials are correct

### Database connection errors
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
