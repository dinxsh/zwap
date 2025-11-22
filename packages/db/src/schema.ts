import { pgTable, text, timestamp, decimal, uuid, pgEnum } from "drizzle-orm/pg-core";

// Enum for deposit status
export const depositStatusEnum = pgEnum("deposit_status", [
	"pending",
	"sent",
	"failed",
]);

// Enum for asset types
export const assetEnum = pgEnum("asset", ["SOL", "USDC"]);

// Deposits table
export const deposits = pgTable("deposits", {
	id: uuid("id").defaultRandom().primaryKey(),
	userPubkey: text("user_pubkey").notNull(),
	asset: assetEnum("asset").notNull(),
	amount: decimal("amount", { precision: 18, scale: 9 }).notNull(),
	zAddress: text("z_address").notNull(),
	solanaTx: text("solana_tx"),
	zecTxid: text("zec_txid"),
	status: depositStatusEnum("status").notNull().default("pending"),
	depositId: text("deposit_id").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Deposit = typeof deposits.$inferSelect;
export type NewDeposit = typeof deposits.$inferInsert;