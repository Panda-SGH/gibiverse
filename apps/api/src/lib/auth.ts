import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import db from "../db/index.js"
import * as schema from "../db/schema/auth.js"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",").map((s) => s.trim())
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://localhost:8787",
        ]),
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  socialProviders: {
    google: {
      clientId:
        (process.env.GOOGLE_CLIENT_ID as string) || "ci-test-google-client-id",
      clientSecret:
        (process.env.GOOGLE_CLIENT_SECRET as string) ||
        "ci-test-google-client-secret",
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || "ci-test-secret-32-bytes-long-pad",
})
