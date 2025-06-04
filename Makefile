# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hulefevr <hulefevr@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/26 17:45:30 by hulefevr          #+#    #+#              #
#    Updated: 2025/06/04 17:09:27 by hulefevr         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Variables
PROJECT_NAME = ft_transcendence
DEV_COMPOSE = docker-compose.dev.yml
PROD_COMPOSE = docker-compose.yml

.PHONY: build up down restart logs prune clean rebuild \
        build-dev up-dev down-dev restart-dev logs-dev rebuild-dev \
        build-prod up-prod down-prod restart-prod logs-prod rebuild-prod \
		reset-db log \

#########################################################
### ------------------ ENV DEV ---------------------- ###
#########################################################

build-dev:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) build

up-dev:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up -d

down-dev:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) down

restart-dev:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) down
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up -d

logs-dev:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) logs -f

re-dev:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down --volumes --remove-orphans --rmi all
	docker volume prune -f
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up --build -d


rebuild-dev:
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) down -v --remove-orphans
	docker system prune -af
	docker volume prune -f
	make reset_vault
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) build --no-cache
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up -d

reset_vault:
	sudo rm -rf ./vault/data ./vault/secrets
	mkdir -p ./vault/data ./vault/secrets

#########################################################
### ------------------ ENV PROD --------------------- ###
#########################################################

build-prod:
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) build

up-prod:
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) up -d

down-prod:
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) down

restart-prod:
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) down
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) up -d

logs-prod:
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) logs -f

rebuild-prod:
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) down -v --remove-orphans
	docker system prune -af
	docker volume prune -f
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) build --no-cache
	docker-compose -f $(PROD_COMPOSE) -p $(PROJECT_NAME) up -d

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


logs:
	@mkdir -p ./logs
	@for container in $$(docker ps --format '{{.Names}}'); do \
		echo "Redirecting logs for $$container"; \
		docker logs -f $$container > ./logs/$$container.log 2>&1 & \
	done

reset-db:
	@echo "🗑️  Suppression de la base SQLite..."
	rm -f ./backend/dev.db
	@echo "🔄 Réinitialisation de la base avec Prisma..."
	cd backend && npx prisma migrate reset --force
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
