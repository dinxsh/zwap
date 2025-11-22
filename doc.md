Solana → Zcash Private Transfer System
Objective
Create a simple demo where users deposit SOL or USDC on Solana, and a backend relayer sends equivalent ZEC to their shielded Zcash address using the Zcash z_sendmany RPC
Product Summary
A lightweight app that provides:
a deposit flow on Solana


a backend that listens to deposit events


a Zcash full node that broadcasts a shielded ZEC transaction


a status page showing the ZEC TXID


This demonstrates cross-chain value transfer into a privacy pool with minimal effort.
Core User Flow
User selects SOL/USDC and enters a Zcash shielded address


User signs a Solana deposit transaction


A backend relayer detects the deposit on-chain


Relayer sends ZEC to the provided shielded address


User sees confirmation and ZEC TXID



System Architecture
Frontend
React + Solana Wallet Adapter


Deposit page: amount, asset, Z-address input


Status page: shows deposit + ZEC TXID


Calls backend endpoints /start-deposit and /status/:id


Backend (API)
Minimal Node/Python server


Stores deposit data in Supabase/Postgres


Provides Solana deposit instruction metadata


Exposes simple status endpoints


Does not perform token conversion automatically unless configured


Relayer
Listens to Solana logs via WebSocket RPC


Matches deposit events against Supabase


Calls Zcash RPC z_sendmany to send ZEC


Polls operation status until completed


Updates DB with ZEC TXID and marks status as sent


Solana Program
One instruction: deposit


Transfers SOL or USDC into a program-owned vault


Emits a structured DepositEvent containing user pubkey, asset, amount, deposit_id


No PDAs required beyond a fixed vault account


No commitments, no receipts, no ZK


Zcash Integration
Use zcashd fully synced


Create a single shielded address for relayer funds


Required RPC methods:
 z_sendmany, z_getoperationstatus, z_getoperationresult, sendrawtransaction
Data Model
deposits
id


user_pubkey


asset (SOL/USDC)


amount


z_address


solana_tx


zec_txid


status (pending, sent)


timestamps
Backend Endpoints
POST /start-deposit
Input: asset, amount, z_address
 Output: deposit_id, solana instruction metadata for deposit
GET /status/:deposit_id
Output: status, solana_tx, zec_txid (when available)
Relayer Logic Flow
Subscribe to program logs


Parse DepositEvent


Fetch deposit record


Convert SOL/USDC → ZEC value (static rate or hardcoded for demo)


Call Zcash RPC:
 z_sendmany <relayer_shielded_addr> [{address: user_z_addr, amount: zec_value}]


Poll status until ZEC TXID is available


Update DB record and mark as sent




Frontend Requirements
Validate Zcash Z-address format


Detect wallet and send deposit transaction


Poll backend every 3–5 seconds for status


Show ZEC TXID with link to explorer


Security Considerations
Validate Z-address via regex


Backend verifies deposit amount matches event


Store Zcash RPC credentials in environment variables only


Never store spending keys in the database


Allow CORS only for frontend origin


Ensure Solana vault accounts are program-owned
Folder Structure
frontend/
backend/
  api/
  relayer/
solana-program/
zcash/

Dependencies
Solana Toolchain (Anchor optional)


@solana/web3.js


zcashd full node


Node/Python backend


Supabase/Postgres for storage





---

## Implementation Plan

### Phase 1: Database & Schema Setup
**Status**: Not Started
**Priority**: High

1. **Create Database Schema**
   - Define [`deposits`](packages/db/src/index.ts:1) table with all required fields
   - Set up Drizzle ORM models
   - Create migration files
   - Add indexes for efficient querying

**Files to Create/Modify**:
- [`packages/db/src/schema.ts`](packages/db/src/schema.ts) - Database schema definitions
- [`packages/db/drizzle/`](packages/db/drizzle/) - Migration files

---

### Phase 2: Solana Program Implementation
**Status**: Not Started
**Priority**: High

1. **Implement Deposit Instruction**
   - Add [`deposit()`](packages/solana/programs/zwap/src/lib.rs:9) instruction to Rust program
   - Create vault account structure
   - Implement SOL/USDC transfer logic
   - Emit structured DepositEvent
   - Add proper error handling

2. **Build Client SDK**
   - Create TypeScript wrapper for deposit instruction
   - Add transaction building helpers
   - Export types and utilities

**Files to Modify**:
- [`packages/solana/programs/zwap/src/lib.rs`](packages/solana/programs/zwap/src/lib.rs) - Anchor program
- [`packages/solana/src/client.ts`](packages/solana/src/client.ts) - Client SDK
- [`packages/solana/src/types.ts`](packages/solana/src/types.ts) - Type definitions

---

### Phase 3: Backend API Development
**Status**: Not Started
**Priority**: High

1. **Create Deposit Router**
   - Implement [`POST /start-deposit`](packages/api/src/routers/index.ts:1) endpoint
   - Implement [`GET /status/:deposit_id`](packages/api/src/routers/index.ts:1) endpoint
   - Add validation for Z-addresses
   - Generate Solana instruction metadata

2. **Set Up Database Context**
   - Connect tRPC context to database
   - Add deposit repository methods

**Files to Create/Modify**:
- [`packages/api/src/routers/deposit.ts`](packages/api/src/routers/deposit.ts) - Deposit endpoints
- [`packages/api/src/context.ts`](packages/api/src/context.ts) - Add DB connection

---

### Phase 4: Zcash Integration
**Status**: Not Started
**Priority**: High

1. **Build Zcash RPC Client**
   - Replace mock Zorion bridge with real Zcash RPC
   - Implement [`z_sendmany()`](packages/zcash/src/client.ts:1) wrapper
   - Implement [`z_getoperationstatus()`](packages/zcash/src/client.ts:1) wrapper
   - Add proper error handling and retries

2. **Configure Zcash Connection**
   - Add RPC URL configuration
   - Set up authentication
   - Create relayer shielded address

**Files to Modify**:
- [`packages/zcash/src/client.ts`](packages/zcash/src/client.ts) - Complete rewrite for zcashd RPC
- [`packages/zcash/src/types.ts`](packages/zcash/src/types.ts) - RPC types

---

### Phase 5: Relayer Service
**Status**: Not Started
**Priority**: High

1. **Create Relayer Process**
   - Subscribe to Solana program logs via WebSocket
   - Parse DepositEvent from logs
   - Match events to database records
   - Call Zcash RPC to send ZEC
   - Poll operation status
   - Update database with TXID

2. **Add Conversion Logic**
   - Implement SOL/USDC to ZEC conversion
   - Add configurable exchange rates

**Files to Create**:
- [`packages/api/src/services/relayer.ts`](packages/api/src/services/relayer.ts) - Main relayer logic
- [`packages/api/src/services/conversion.ts`](packages/api/src/services/conversion.ts) - Rate conversion

---

### Phase 6: Frontend Integration
**Status**: Partially Complete
**Priority**: Medium

1. **Complete Deposit Flow**
   - Connect [`deposit-form.tsx`](apps/web/src/components/deposit-form.tsx:29) to tRPC API
   - Build and sign Solana transaction
   - Handle transaction submission
   - Redirect to status page

2. **Implement Status Page**
   - Poll backend for deposit status
   - Display Solana TX signature
   - Display ZEC TXID when available
   - Add block explorer links

**Files to Modify**:
- [`apps/web/src/components/deposit-form.tsx`](apps/web/src/components/deposit-form.tsx) - Complete TODO
- [`apps/web/src/app/status/[signature]/page.tsx`](apps/web/src/app/status/[signature]/page.tsx) - Add polling logic

---

### Phase 7: Configuration & Environment
**Status**: Not Started
**Priority**: Medium

1. **Add Environment Variables**
   - Database connection string
   - Solana RPC URL
   - Zcash RPC credentials
   - Program IDs
   - CORS origins

2. **Create Config Management**
   - Centralized config loading
   - Validation of required vars
   - Development/production modes

**Files to Create/Modify**:
- [`apps/web/.env.example`](apps/web/.env.example) - Update with all vars
- [`packages/api/.env.example`](packages/api/.env.example) - Create for backend

---

### Phase 8: Testing & Deployment
**Status**: Not Started
**Priority**: Low

1. **Testing**
   - Unit tests for conversion logic
   - Integration tests for relayer
   - E2E test for full deposit flow

2. **Deployment**
   - Deploy Solana program to devnet
   - Set up Zcash testnet node
   - Deploy backend services
   - Deploy frontend

---

## Current State Analysis

### ✅ Completed
- Project structure scaffolding
- Frontend wallet integration
- Basic UI components
- tRPC setup

### 🚧 In Progress
- Deposit form UI (needs backend connection)
- Status page skeleton (needs polling logic)

### ❌ Not Started
- Solana program deposit instruction
- Database schema and migrations
- Backend deposit endpoints
- Zcash RPC client
- Relayer service
- Full E2E integration

---

## Next Immediate Steps

1. **Database Schema** - Define the deposits table structure
2. **Solana Program** - Implement the core deposit instruction
3. **Backend API** - Create deposit and status endpoints
4. **Zcash Client** - Replace mock with real RPC implementation
5. **Relayer** - Build the monitoring and ZEC sending service

---

## Technical Decisions

### Why This Approach?
- **Simplicity**: No ZK proofs, no complex cryptography
- **Monorepo**: Easier development and code sharing
- **TypeScript**: Type safety across frontend/backend
- **Anchor**: Faster Solana program development
- **tRPC**: Type-safe API without code generation
- **Drizzle**: Modern ORM with migrations

### Trade-offs
- ⚠️ No decentralization - single relayer point of failure
- ⚠️ Trust required - relayer controls ZEC funds
- ⚠️ No atomic swaps - separate transactions on each chain
- ✅ Fast development - can build MVP in days
- ✅ Simple to understand - clear flow of funds
- ✅ Easy to test - no complex protocols

---

## Dependencies to Install

```bash
# Solana program
cd packages/solana
cargo build-sbf

# Database
cd packages/db
bun add drizzle-orm postgres
bun add -D drizzle-kit

# Zcash package
cd packages/zcash
bun add axios

# Backend API
cd packages/api
bun add @solana/web3.js ws

# Frontend (already mostly done)
cd apps/web
# Dependencies already installed
```

---

## Development Workflow

1. **Start Database**: `docker-compose up -d` (need to create)
2. **Run Migrations**: `cd packages/db && bun run migrate`
3. **Start Backend**: `cd apps/web && bun run dev` (Next.js API routes)
4. **Start Relayer**: `cd packages/api && bun run relayer` (separate process)
5. **Build Solana Program**: `cd packages/solana && anchor build && anchor deploy`

---
