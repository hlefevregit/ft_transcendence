# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hulefevr <hulefevr@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/26 17:45:30 by hulefevr          #+#    #+#              #
#    Updated: 2025/07/02 15:18:39 by hulefevr         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

PROJECT_NAME = ft_transcendence
DEV_COMPOSE = docker-compose.dev.yml
PROD_COMPOSE = docker-compose.yml

VOLUME_DIRS = \
	vault/data \
	vault/secrets \
	elk/elasticsearch/data \
	backend/main/prisma/sqlite

.PHONY: build up down restart logs prune clean rebuild \
        build-dev up-dev down-dev restart-dev logs-dev rebuild-dev \
        build-prod up-prod down-prod restart-prod logs-prod rebuild-prod \
		reset-db log prepare post-build

#########################################################
### ------------------ ENV DEV ---------------------- ###
#########################################################

prepare:
	@echo "📁 Création des dossiers nécessaires..."
	@mkdir -p $(VOLUME_DIRS)
	@touch ./vault/secrets/.env

post-build:
	@make rebuild name=backend
	# @make rebuild name=kibana
	# @make rebuild name=nginx

build:
	@make prepare
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) build

up:
	@make prepare
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up -d
	@make post-build

down:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) down

restart:
	@make down
	@make up

logs:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) logs -f

re:
	@make prepare
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) down --volumes --remove-orphans --rmi all
	docker volume prune -f
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up --build -d
	@make post-build

rebuild-prod:
	@make prepare
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) down -v --remove-orphans
	docker system prune -af
	docker volume prune -f
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) build --no-cache
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up -d
	@make post-build

reset_vault:
	docker exec -it ft_transcendence-vault-1 chmod -R 777 ./vault/file || true
	rm -rf ./vault/data ./vault/secrets
	mkdir -p ./vault/data ./vault/secrets

#########################################################
### ------------------ GLOBALES --------------------- ###
#########################################################

clean:
	docker stop $$(docker ps -aq) || true
	docker rm $$(docker ps -aq) || true
	docker rmi -f $$(docker images -aq) || true
	docker volume rm $$(docker volume ls -q) || true
	docker network prune -f || true

prune:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) down -v --remove-orphans
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) down -v --remove-orphans
	docker system prune -af
	docker volume prune -f

logs-all:
	@mkdir -p ./logs
	@for container in $$(docker ps --format '{{.Names}}'); do \
		echo "Redirecting logs for $$container"; \
		docker logs -f $$container > ./logs/$$container.log 2>&1 & \
	done

reset-db:
	@echo "🗑️  Suppression de la base SQLite..."
	rm -f ./backend/dev.db
	@echo "🔄 Réinitialisation de la base avec Prisma..."
	cd backend/main && npx prisma migrate reset --force
	@echo "✅ Base de données réinitialisée."

rebuild:
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: please provide a container name (e.g. 'make rebuild name=backend')"; \
		exit 1; \
	fi
	@echo "🔨 Rebuilding container: $(name)"
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) build --no-cache $(name)
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up -d $(name)

log:
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: please provide a container name (e.g. 'make log name=backend')"; \
		exit 1; \
	fi
	@echo "📜 Displaying logs for container: $(name)"
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) logs -f $(name)
