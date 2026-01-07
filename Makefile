.PHONY: help up down logs restart test clean

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services
	docker compose up -d

down: ## Stop all services
	docker compose down

logs: ## Show logs for all services
	docker compose logs -f

restart: ## Restart all services
	docker compose restart

test: ## Run test script
	./test.sh

clean: ## Stop and remove all containers and volumes
	docker compose down -v

build: ## Build Docker images
	docker compose build

ps: ## Show running containers
	docker compose ps
