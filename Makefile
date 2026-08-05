-include .env
export

BASE_URL := http://localhost:3000

.DEFAULT_GOAL := help

.PHONY: help up down i build swagger health \
	user-create user-get user-todos \
	todo-create todo-list todo-list-by-user todo-get todo-update todo-complete todo-delete \
	throttle-test

## --- Help ---

help: ## Show this help
	@echo ""
	@echo "Usage: make <target> [VAR=value ...]"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  make user-create USERNAME=jane NAME=\"Jane Doe\""
	@echo "  make todo-create TITLE=\"Ship it\" USER_ID=2"
	@echo "  make todo-update ID=1 TITLE=\"New title\""
	@echo ""

## --- Infra ---

up: ## Start Postgres only (detached)
	docker compose up -d postgres

build: ## Build and start all containers (postgres, redis, api)
	docker compose up --build

down: ## Stop and remove all containers
	docker compose down

i: ## Install dependencies (pnpm)
	pnpm install

swagger: ## Open Swagger docs in the browser (/docs)
	open $(BASE_URL)/docs

## --- Health ---

health: ## GET /health — check API, database, and cache status
	curl -i $(BASE_URL)/health

## --- User endpoints ---

user-create: ## POST /user — USERNAME, NAME, TODO (optional first todo title)
	curl -i -X POST $(BASE_URL)/user \
		-H "Content-Type: application/json" \
		-d '{"username": "$(or $(USERNAME),yusuf)", "displayName": "$(or $(NAME),Yusuf)", "firstTodoTitle": "$(TODO)"}'

user-get: ## GET /user/:id — ID (default 1)
	curl -i $(BASE_URL)/user/$(or $(ID),1)

user-todos: ## GET /user/:id/todos — ID (default 1)
	curl -i $(BASE_URL)/user/$(or $(ID),1)/todos

## --- Todo endpoints ---

todo-create: ## POST /todo — TITLE, DESC, USER_ID (default 1)
	curl -i -X POST $(BASE_URL)/todo \
		-H "Content-Type: application/json" \
		-d '{"title": "$(or $(TITLE),Learn NestJS)", "description": "$(DESC)", "userId": $(or $(USER_ID),1)}'

todo-list: ## GET /todo — list all todos
	curl -i $(BASE_URL)/todo

todo-list-by-user: ## GET /todo?userId= — USER_ID (default 1)
	curl -i "$(BASE_URL)/todo?userId=$(or $(USER_ID),1)"

todo-get: ## GET /todo/:id — ID (default 1)
	curl -i $(BASE_URL)/todo/$(or $(ID),1)

todo-update: ## PATCH /todo/:id — ID, TITLE
	curl -i -X PATCH $(BASE_URL)/todo/$(or $(ID),1) \
		-H "Content-Type: application/json" \
		-d '{"title": "$(TITLE)"}'

todo-complete: ## PATCH /todo/:id — ID, marks isComplete true
	curl -i -X PATCH $(BASE_URL)/todo/$(or $(ID),1) \
		-H "Content-Type: application/json" \
		-d '{"isComplete": true}'

todo-delete: ## DELETE /todo/:id — ID (default 1)
	curl -i -X DELETE $(BASE_URL)/todo/$(or $(ID),1)

## --- Rate limit test ---

throttle-test: ## Fire 8 rapid POSTs to /todo — expect 201 x5 then 429 x3
	@for i in 1 2 3 4 5 6 7 8; do \
		echo "Request $$i:"; \
		curl -s -o /dev/null -w "%{http_code}\n" -X POST $(BASE_URL)/todo \
			-H "Content-Type: application/json" \
			-d '{"title": "Throttle test", "userId": 1}'; \
	done
