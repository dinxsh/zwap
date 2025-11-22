export interface ZcashConfig {
	rpcUrl: string;
	rpcUser: string;
	rpcPassword: string;
}

export interface ZSendManyAmount {
	address: string;
	amount: number;
	memo?: string;
}

export interface OperationStatus {
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
}

export interface ZcashBalance {
	transparent: string;
	private: string;
	total: string;
}

export interface AddressValidation {
	isvalid: boolean;
	address?: string;
	scriptPubKey?: string;
	ismine?: boolean;
	iswatchonly?: boolean;
	isscript?: boolean;
	type?: "shielded" | "transparent";
}

export interface BlockchainInfo {
	chain: string;
	blocks: number;
	bestblockhash: string;
	difficulty: number;
	verificationprogress: number;
	chainwork: string;
}
