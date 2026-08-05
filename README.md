<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository — extended here into a production-ready **Todo List API** with Postgres, Redis caching, structured logging, health checks, rate limiting, and full Docker Compose orchestration.

---

## Stack

- **Framework:** NestJS 11
- **Database:** PostgreSQL 15, via Prisma 7 (driver adapter model, `@prisma/adapter-pg`)
- **Cache:** Redis 7, via `cache-manager` + `Keyv` (`@keyv/redis`)
- **Logging:** Structured JSON logs via `nestjs-pino`
- **Docs:** Swagger/OpenAPI at `/docs`
- **Health checks:** `@nestjs/terminus` at `/health` (Postgres + Redis indicators)
- **Rate limiting:** `@nestjs/throttler` (global default + per-route overrides)
- **Security:** Helmet, CORS (origin allowlist), gzip compression
- **Containerization:** Docker Compose with health-gated startup and live-reload via `watch`

---

## Project setup

### 1. Environment variables

Copy `.env.example` (or create `.env` in the project root) with:

```
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb
DATABASE_URL="postgresql://myuser:mypassword@localhost:5472/mydb?schema=public"
REDIS_URL="redis://localhost:6379"
ALLOWED_ORIGINS=http://localhost:5173
```

> `DATABASE_URL`/`REDIS_URL` above are the **host-facing** values, used when running the app locally (`pnpm start:dev`) or for local Prisma CLI commands. Inside Docker Compose, the `api` service overrides these with container-network addresses (`postgres:5432`, `redis:6379`) automatically — you don't need to change anything for the Dockerized flow.

Environment variables are validated at boot via a Joi schema (`src/config/env.validation.ts`). Missing or malformed vars will fail the app fast and loud at startup rather than causing a confusing runtime error later.

### 2. Install dependencies

```bash
make i
# or: pnpm install
```

### 3. Run with Docker (recommended)

```bash
make build
# or: docker compose up --build
```

This builds the API image, starts Postgres + Redis with health checks, waits for both to be healthy before starting the API, and runs Prisma migrations automatically on boot.

### 4. Run with live-reload (recommended for active development)

```bash
docker compose up --build --watch
```

File changes under `src/` and `prisma/` sync into the running container automatically; changes to `package.json` trigger a full rebuild. No need to manually `down`/`up --build` on every change.

---

## Running locally (without Docker for the API)

If you'd rather run the Nest app natively on your host while keeping Postgres/Redis in Docker:

```bash
make up                 # starts Postgres only
docker compose up -d redis
pnpm run start:dev
```

Make sure `.env` points at the **host-exposed** ports (`localhost:5472` for Postgres, `localhost:6379` for Redis) in this mode.

## Compile and run the project (native, no Docker)

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

---

## Testing endpoints

A `Makefile` wraps every endpoint in a ready-to-run `curl` command, so you don't need to hand-type requests while testing.

```bash
make help
```

```
Usage: make <target> [VAR=value ...]

  help                   Show this help
  up                     Start Postgres only (detached)
  build                  Build and start all containers (postgres, redis, api)
  down                   Stop and remove all containers
  i                      Install dependencies (pnpm)
  swagger                Open Swagger docs in the browser (/docs)
  health                 GET /health — check API, database, and cache status
  user-create            POST /user — USERNAME, NAME, TODO (optional first todo title)
  user-get               GET /user/:id — ID (default 1)
  user-todos             GET /user/:id/todos — ID (default 1)
  todo-create            POST /todo — TITLE, DESC, USER_ID (default 1)
  todo-list              GET /todo — list all todos
  todo-list-by-user      GET /todo?userId= — USER_ID (default 1)
  todo-get               GET /todo/:id — ID (default 1)
  todo-update            PATCH /todo/:id — ID, TITLE
  todo-complete          PATCH /todo/:id — ID, marks isComplete true
  todo-delete            DELETE /todo/:id — ID (default 1)
  throttle-test          Fire 8 rapid POSTs to /todo — expect 201 x5 then 429 x3

Examples:
  make user-create USERNAME=jane NAME="Jane Doe"
  make todo-create TITLE="Ship it" USER_ID=2
  make todo-update ID=1 TITLE="New title"
```

Full interactive API docs (with a "Try it out" button) are also available via Swagger:

```bash
make swagger
```

---

## Architecture notes

- **Layering:** Controller (HTTP only) → Service (business logic, caching, logging) → Prisma (persistence). Controllers never call Prisma directly.
- **Caching:** Cache-aside pattern via Redis/Keyv. Reads check cache first, populate on miss; writes invalidate the relevant cache key immediately.
- **Observability:** Every request is logged as structured JSON (method, path, status, response time) via `nestjs-pino`. Services additionally log domain events (`Todo created`, `Cache hit`/`Cache miss`, etc.) tagged by originating class.
- **Error handling:** A global exception filter (`AllExceptionsFilter`) normalizes every error response to a consistent shape and logs full details server-side, without leaking stack traces to clients.
- **Config:** All environment variables are validated once at boot (`ConfigModule` + Joi) — no service reaches for `process.env` without a guarantee it's already been validated.
- **Health:** `/health` checks live connectivity to both Postgres and Redis, exempt from rate limiting, suitable for use as a Docker/Kubernetes readiness probe.

---

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
