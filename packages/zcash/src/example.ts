/**
 * Example usage of ZcashClient with Zorion Bridge
 * 
 * This file demonstrates how to:
 * 1. Deposit ZEC and receive zZEC on Solana
 * 2. Withdraw zZEC and receive ZEC to a shielded address
 */

import { ZcashClient } from "./client";
import { Connection, PublicKey } from "@solana/web3.js";

// Example: Initialize the client
const connection = new Connection("https://api.mainnet-beta.solana.com");
const zcashClient = new ZcashClient({ connection });

// Example: Get deposit address for a user
async function getDepositAddressExample() {
  const userSolanaAddress = new PublicKey("YourSolanaAddressHere");
  const { zcashDepositAddress } = await zcashClient.getDepositAddress(userSolanaAddress);
  
  console.log("Send ZEC to this address:", zcashDepositAddress);
  console.log("After confirmations, zZEC will be minted to:", userSolanaAddress.toString());
}

// Example: Withdraw zZEC to Zcash
async function withdrawExample() {
  const userSolanaAddress = new PublicKey("YourSolanaAddressHere");
  const zcashUnifiedAddress = "u1q9...shielded"; // User's Zcash Unified Address
  
  await zcashClient.withdraw({
    from: userSolanaAddress,
    amount: "1.25", // Amount in ZEC
    zcashAddress: zcashUnifiedAddress,
    // Optional: viewingKey for selective disclosure/compliance
    // viewingKey: "your-viewing-key-here",
  });
  
  console.log("Withdrawal initiated! ZEC will be sent to:", zcashUnifiedAddress);
}

// Example: Using with a wallet adapter
async function withdrawWithWalletExample(wallet: {
  publicKey: PublicKey;
  signTransaction: any;
  signAllTransactions: any;
}) {
  await zcashClient.withdraw({
    from: wallet.publicKey,
    amount: "0.5",
    zcashAddress: "u1q9...shielded",
  });
}

