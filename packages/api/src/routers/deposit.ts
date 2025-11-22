import { z } from "zod";
import { router, publicProcedure } from "../index";
import { db, deposits } from "@zwap/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Zcash address validation regex
const ZCASH_ADDRESS_REGEX = /^(z|u1)[a-zA-Z0-9]{50,95}$/;

export const depositRouter = router({
	// Start a new deposit
	startDeposit: publicProcedure
		.input(
			z.object({
				asset: z.enum(["SOL", "USDC"]),
				amount: z.string().regex(/^\d+(\.\d+)?$/),
				zAddress: z.string().regex(ZCASH_ADDRESS_REGEX, {
					message:
						"Invalid Zcash shielded address. Must start with 'z' or 'u1'",
				}),
				userPubkey: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const depositId = randomUUID();

			// Insert deposit record
			const [deposit] = await db
				.insert(deposits)
				.values({
					depositId,
					userPubkey: input.userPubkey,
					asset: input.asset,
					amount: input.amount,
					zAddress: input.zAddress,
					status: "pending",
				})
				.returning();

			return {
				depositId: deposit.depositId,
				id: deposit.id,
				message: "Deposit created successfully",
			};
		}),

	// Get deposit status
	getStatus: publicProcedure
		.input(
			z.object({
				depositId: z.string().uuid(),
			}),
		)
		.query(async ({ input }) => {
			const [deposit] = await db
				.select()
				.from(deposits)
				.where(eq(deposits.depositId, input.depositId))
				.limit(1);

			if (!deposit) {
				throw new Error("Deposit not found");
			}

			return {
				id: deposit.id,
				depositId: deposit.depositId,
				asset: deposit.asset,
				amount: deposit.amount,
				zAddress: deposit.zAddress,
				status: deposit.status,
				solanaTx: deposit.solanaTx,
				zecTxid: deposit.zecTxid,
				createdAt: deposit.createdAt,
				updatedAt: deposit.updatedAt,
			};
		}),

	// Update deposit with Solana transaction signature
	updateSolanaTx: publicProcedure
		.input(
			z.object({
				depositId: z.string().uuid(),
				solanaTx: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(deposits)
				.set({
					solanaTx: input.solanaTx,
					updatedAt: new Date(),
				})
				.where(eq(deposits.depositId, input.depositId))
				.returning();

			if (!updated) {
				throw new Error("Deposit not found");
			}

			return {
				success: true,
				depositId: updated.depositId,
			};
		}),

	// Get deposit by Solana transaction signature (for status page)
	getBySignature: publicProcedure
		.input(
			z.object({
				signature: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const [deposit] = await db
				.select()
				.from(deposits)
				.where(eq(deposits.solanaTx, input.signature))
				.limit(1);

			if (!deposit) {
				throw new Error("Deposit not found");
			}

			return {
				id: deposit.id,
				depositId: deposit.depositId,
				asset: deposit.asset,
				amount: deposit.amount,
				zAddress: deposit.zAddress,
				status: deposit.status,
				solanaTx: deposit.solanaTx,
				zecTxid: deposit.zecTxid,
				createdAt: deposit.createdAt,
				updatedAt: deposit.updatedAt,
			};
		}),
});