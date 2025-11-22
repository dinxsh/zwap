import { publicProcedure, router } from "../index";
import { authRouter } from "./auth";
import { depositRouter } from "./deposit";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	auth: authRouter,
	deposit: depositRouter,
});
export type AppRouter = typeof appRouter;
