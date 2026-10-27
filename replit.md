# ParkEasy

An educational parking-lot system with matching TypeScript web and pure-Java console demos.

## Run & Operate

- `pnpm --filter @workspace/parkeasy run dev` — run the ParkEasy web app
- `pnpm --filter @workspace/parkeasy run typecheck` — typecheck the web app
- From `artifacts/parkeasy/java`: `javac -d out src/main/java/com/parkeasy/parking/*.java && java -cp out com.parkeasy.parking.Main` — compile and run the Java console app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The ParkEasy demos keep all lot state in memory and do not use the database.
- The separate shared API server still uses `DATABASE_URL`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/parkeasy/src/domain/` — TypeScript parking lot, vehicles, and strategy classes
- `artifacts/parkeasy/src/` — ParkEasy web interface
- `artifacts/parkeasy/java/src/main/java/com/parkeasy/parking/` — standalone Java console app
- `artifacts/parkeasy/java/README.md` — Java run instructions, pattern guide, and text class diagram
- `lib/api-spec/openapi.yaml` — shared API contract
- `lib/db/src/schema/` — shared API database schema

## Architecture decisions

- ParkEasy is a self-contained demonstration; its web and Java versions use in-memory state, not the shared API or database.
- Both versions match vehicles to exact slot sizes and choose the lowest-numbered free slot of that size.
- Card, UPI, and cash payments are simulated; the app does not process real payments.
- The Java version uses only the JDK and can be run independently of the web app.

## Product

ParkEasy demonstrates parking, ticketing, exit fees, simulated payments, and completed-ticket history through a web interface and a Java console menu. It also explains the Singleton, Factory, and Strategy patterns used by each version.

## User preferences

- Keep the TypeScript web app and pure Java console version together in one ParkEasy project.
- Use no database for the parking-lot demos.

## Gotchas

- Java source is separate from the Vite TypeScript app; run it from `artifacts/parkeasy/java` with a JDK.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
