/**
 * Exchange rate service for converting SOL/USDC to ZEC
 * In production, this should fetch real-time rates from exchanges
 */

export interface ExchangeRates {
	solToZec: number;
	usdcToZec: number;
}

/**
 * Get current exchange rates
 * For demo purposes, using hardcoded rates
 * In production, integrate with price APIs like CoinGecko, CoinMarketCap, etc.
 */
export function getExchangeRates(): ExchangeRates {
	// Demo rates (not real)
	// 1 SOL ≈ 0.5 ZEC
	// 1 USDC ≈ 0.02 ZEC (assuming ZEC ≈ $50 and SOL ≈ $100)
	return {
		solToZec: 0.5,
		usdcToZec: 0.02,
	};
}

/**
 * Convert SOL amount to ZEC
 * @param solAmount Amount in SOL (not lamports)
 * @param rate SOL to ZEC exchange rate
 */
export function convertSolToZec(solAmount: number, rate?: number): number {
	const exchangeRate = rate || getExchangeRates().solToZec;
	return solAmount * exchangeRate;
}

/**
 * Convert USDC amount to ZEC
 * @param usdcAmount Amount in USDC (not micro-USDC)
 * @param rate USDC to ZEC exchange rate
 */
export function convertUsdcToZec(usdcAmount: number, rate?: number): number {
	const exchangeRate = rate || getExchangeRates().usdcToZec;
	return usdcAmount * exchangeRate;
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
	return lamports / 1e9;
}

/**
 * Convert micro-USDC to USDC
 */
export function microUsdcToUsdc(microUsdc: number): number {
	return microUsdc / 1e6;
}