// Drizzle Kit config.
//
// Deliberately imports nothing. `defineConfig` is an identity helper — it only
// adds editor types — but importing it makes this file fail to load whenever the
// binary reading it is not the one in ./node_modules. That is what happened on
// the last deploy: `drizzle-kit` was not present locally, so it was fetched into
// the npx cache, and the `require("drizzle-kit")` in this file resolved against
// the repo root and threw "Cannot find module 'drizzle-kit'" before the config
// was ever read. A plain object is exactly what defineConfig returns, and it
// loads no matter where the binary came from.
export default {
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "netlify/database/migrations",
};
