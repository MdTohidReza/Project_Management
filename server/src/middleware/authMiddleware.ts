import { Elysia } from "elysia";
import { verifyToken } from "@clerk/backend";

export interface AuthContext {
  userId: string;
}

export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "global" },
  async ({ headers, set }): Promise<AuthContext> => {
    try {
      const secretKey = process.env.CLERK_SECRET_KEY;

      if (!secretKey) {
        // console.error("❌ CLERK_SECRET_KEY is not defined");
        set.status = 500;
        throw new Error("Server configuration error");
      }

      const authHeader = headers.authorization;

      if (!authHeader) {
        set.status = 401;
        throw new Error("Authorization header missing");
      }

      if (!authHeader.startsWith("Bearer ")) {
        set.status = 401;
        throw new Error("Invalid Authorization header");
      }

      const token = authHeader.replace("Bearer ", "");

      // console.log("Received Token:", token.substring(0, 30) + "...");

      const payload = await verifyToken(token, {
        secretKey,
      });

      // console.log("Verified Payload:", payload);

      if (!payload.sub) {
        set.status = 401;
        throw new Error("User ID not found in token");
      }

      return {
        userId: payload.sub,
      };
    } catch (error) {
      console.error("❌ Clerk verifyToken Error:");
      console.error(error);

      set.status = 401;

      throw new Error(
        error instanceof Error ? error.message : "Unauthorized"
      );
    }
  }
);