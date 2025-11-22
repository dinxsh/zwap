import axios, { type AxiosInstance } from "axios";
import { z } from "zod";

const zcashConfigSchema = z.object({
	rpcUrl: z.string().url(),
	rpcUser: z.string(),
	rpcPassword: z.string(),
});

export type ZcashConfig = z.infer<typeof zcashConfigSchema>;

interface ZcashRPCResponse<T> {
	result: T;
	error: { code: number; message: string } | null;
	id: string | number;
}

export class ZcashClient {
	private client: AxiosInstance;
	private requestId = 0;

	constructor(config: ZcashConfig) {
		const validated = zcashConfigSchema.parse(config);

		this.client = axios.create({
			baseURL: validated.rpcUrl,
			auth: {
				username: validated.rpcUser,
				password: validated.rpcPassword,
			},
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Make a raw RPC call to zcashd
	 */
	private async rpcCall<T>(method: string, params: any[] = []): Promise<T> {
		const response = await this.client.post<ZcashRPCResponse<T>>("", {
			jsonrpc: "1.0",
			id: ++this.requestId,
			method,
			params,
		});

		if (response.data.error) {
			throw new Error(
				`Zcash RPC Error: ${response.data.error.message} (code: ${response.data.error.code})`,
			);
		}

		return response.data.result;
	}

	/**
	 * Send ZEC from a shielded address to another address
	 * @param fromAddress - Source shielded address
	 * @param amounts - Array of {address, amount, memo?} objects
	 * @param minconf - Minimum confirmations (default: 1)
	 * @param fee - Transaction fee in ZEC (default: 0.0001)
	 * @returns Operation ID to track the async operation
	 */
	async zSendMany(
		fromAddress: string,
		amounts: Array<{
			address: string;
			amount: number;
			memo?: string;
		}>,
		minconf = 1,
		fee = 0.0001,
	): Promise<string> {
		return await this.rpcCall<string>("z_sendmany", [
			fromAddress,
			amounts,
			minconf,
			fee,
		]);
	}

	/**
	 * Get the status of async operations
	 * @param operationIds - Optional array of operation IDs to check
	 * @returns Array of operation statuses
	 */
	async zGetOperationStatus(
		operationIds?: string[],
	): Promise<
		Array<{
			id: string;
			status: "queued" | "executing" | "success" | "failed" | "cancelled";
			creation_time: number;
			result?: {
				txid: string;
			};
			error?: {
				code: number;
				message: string;
			};
		}>
	> {
		return await this.rpcCall("z_getoperationstatus", [operationIds]);
	}

	/**
	 * Get and remove the result of async operations
	 * @param operationIds - Optional array of operation IDs
	 * @returns Array of operation results
	 */
	async zGetOperationResult(
		operationIds?: string[],
	): Promise<
		Array<{
			id: string;
			status: string;
			creation_time: number;
			result?: {
				txid: string;
			};
			error?: {
				code: number;
				message: string;
			};
		}>
	> {
		return await this.rpcCall("z_getoperationresult", [operationIds]);
	}

	/**
	 * Get a list of shielded addresses in the wallet
	 */
	async zListAddresses(): Promise<string[]> {
		return await this.rpcCall<string[]>("z_listaddresses");
	}

	/**
	 * Get the balance of a shielded address
	 * @param address - Shielded address
	 * @param minconf - Minimum confirmations (default: 1)
	 */
	async zGetBalance(address: string, minconf = 1): Promise<number> {
		return await this.rpcCall<number>("z_getbalance", [address, minconf]);
	}

	/**
	 * Get total balance across all shielded addresses
	 */
	async zGetTotalBalance(
		minconf = 1,
	): Promise<{
		transparent: string;
		private: string;
		total: string;
	}> {
		return await this.rpcCall("z_gettotalbalance", [minconf]);
	}

	/**
	 * Validate a Zcash address
	 * @param address - Address to validate
	 * @returns Validation info including address type
	 */
	async validateAddress(address: string): Promise<{
		isvalid: boolean;
		address?: string;
		scriptPubKey?: string;
		ismine?: boolean;
		iswatchonly?: boolean;
		isscript?: boolean;
		type?: "shielded" | "transparent";
	}> {
		return await this.rpcCall("z_validateaddress", [address]);
	}

	/**
	 * Get blockchain info
	 */
	async getBlockchainInfo(): Promise<{
		chain: string;
		blocks: number;
		bestblockhash: string;
		difficulty: number;
		verificationprogress: number;
		chainwork: string;
	}> {
		return await this.rpcCall("getblockchaininfo");
	}

	/**
	 * Send a raw transaction to the network
	 * @param hexString - Signed transaction hex
	 * @returns Transaction ID
	 */
	async sendRawTransaction(hexString: string): Promise<string> {
		return await this.rpcCall<string>("sendrawtransaction", [hexString]);
	}

	/**
	 * Wait for an operation to complete
	 * @param operationId - Operation ID to wait for
	 * @param maxWaitSeconds - Maximum time to wait (default: 300 seconds)
	 * @param pollIntervalMs - Polling interval in ms (default: 1000ms)
	 * @returns Final operation result
	 */
	async waitForOperation(
		operationId: string,
		maxWaitSeconds = 300,
		pollIntervalMs = 1000,
	): Promise<{
		success: boolean;
		txid?: string;
		error?: string;
	}> {
		const startTime = Date.now();
		const maxWaitMs = maxWaitSeconds * 1000;

		while (Date.now() - startTime < maxWaitMs) {
			const [status] = await this.zGetOperationStatus([operationId]);

			if (!status) {
				throw new Error(`Operation ${operationId} not found`);
			}

			if (status.status === "success") {
				return {
					success: true,
					txid: status.result?.txid,
				};
			}

			if (status.status === "failed" || status.status === "cancelled") {
				return {
					success: false,
					error: status.error?.message || "Operation failed",
				};
			}

			// Wait before polling again
			await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
		}

		throw new Error(
			`Operation ${operationId} timed out after ${maxWaitSeconds} seconds`,
		);
	}
}
