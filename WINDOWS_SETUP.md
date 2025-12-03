# 🪟 Windows Setup Guide - SIMPLIFIED

## ⚠️ Solana Build Issue on Windows

Building Solana programs natively on Windows is challenging due to toolchain requirements. Here are **3 easy alternatives**:

---

## ✅ Option 1: Use Anchor Playground (EASIEST - Recommended)

No local build needed! Deploy directly from the web:

1. **Visit**: https://beta.solpg.io/
2. **Create New Project**
3. **Copy your program code** from `packages\solana\programs\zwap\src\lib.rs`
4. **Paste** into the playground editor
5. **Click "Build"** in the playground
6. **Connect Wallet** (Phantom on Devnet)
7. **Click "Deploy"**
8. **Copy the Program ID** from the output
9. **Update `.env`** files with the Program ID

✅ **Done! No Windows build hassles!**

---

## ✅ Option 2: Use WSL2 (Linux on Windows)

### One-Time Setup:

```powershell
# Install WSL2 Ubuntu
wsl --install -d Ubuntu

# Restart computer if needed

# Enter WSL
wsl

# Inside WSL, install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Solana
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Navigate to your project (replace 'hp' with your username)
cd /mnt/c/Users/hp/Desktop/code/hacks/zypherphunk/zwap/packages/solana

# Build
anchor build

# Deploy
solana config set --url devnet
solana-keygen new
solana airdrop 2
anchor deploy
```

---

## ✅ Option 3: Use GitHub Codespaces (Cloud Development)

1. **Push your code** to GitHub
2. **Open in Codespaces**
3. **Run in terminal**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   
   cd packages/solana
   anchor build
   anchor deploy
   ```

---

## 🚀 Continue Without Building (Test Frontend)

You can actually **test most of the app without deploying** the Solana program:

### What Works:
- ✅ Frontend UI
- ✅ Wallet connection
- ✅ Database
- ✅ Backend API

### What Doesn't:
- ❌ Actual SOL/USDC deposits (needs deployed program)
- ❌ Transaction signing (needs program)

### Quick Test Setup:

```powershell
# 1. Start database
docker-compose up -d postgres

# 2. Run migrations
bun run db:push

# 3. Start frontend (will work without Solana program)
bun run dev
```

Visit http://localhost:3001 - The UI will load, you can connect wallet, but transactions won't work until you deploy the program using one of the options above.

---

## 📝 Recommended Path for Windows Users

**For Quick Demo:**
1. Use **Anchor Playground** to deploy (5 minutes)
2. Copy Program ID to `.env`
3. Start app with `bun run dev`
4. Test full flow!

**For Serious Development:**
1. Set up **WSL2** (one-time setup, 20 minutes)
2. Build/deploy from WSL
3. Edit files in Windows (VS Code with WSL extension)
4. Run relayer/frontend from Windows

---

## 🎯 Current Status

Your setup is **90% complete**:

✅ Bun installed
✅ Docker running
✅ Database ready
✅ All dependencies installed
✅ Code fully implemented

❌ Only missing: Deployed Solana program

**Fastest solution**: Use Anchor Playground (Option 1) - takes 5 minutes!

---

## 💡 After Getting Program ID

Once you have the Program ID (from any option above):

1. **Update `.env`**:
   ```env
   ZWAP_PROGRAM_ID=<your_program_id>
   NEXT_PUBLIC_ZWAP_PROGRAM_ID=<your_program_id>
   ```

2. **Start the app**:
   ```powershell
   bun run dev
   ```

3. **Test deposit** with devnet SOL!

---

## 🆘 Quick Links

- **Anchor Playground**: https://beta.solpg.io/
- **Devnet Faucet**: https://faucet.solana.com/
- **Phantom Wallet**: https://phantom.app/
- **WSL Install Guide**: https://learn.microsoft.com/en-us/windows/wsl/install

---

You're almost there! Just need that Program ID from one of the 3 easy options above. 🚀
