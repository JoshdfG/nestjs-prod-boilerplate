-include .env
export

.PHONY: up down i build

up: 
	docker compose up -d postgres

build: 
	docker compose up --build

down: 
	docker compose down

i:
	pnpm install

swagger:
	 open http://localhost:3000/docs

