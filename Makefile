# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hulefevr <hulefevr@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/26 17:45:30 by hulefevr          #+#    #+#              #
#    Updated: 2025/04/17 22:20:30 by hulefevr         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Variables
# Variables
PROJECT_NAME = ft_transcendence
DEV_COMPOSE = docker-compose.dev.yml
PROD_COMPOSE = docker-compose.yml

.PHONY: build up down restart logs prune clean rebuild \
        build-dev up-dev down-dev restart-dev logs-dev rebuild-dev \
        build-prod up-prod down-prod restart-prod logs-prod rebuild-prod

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
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) build --no-cache
	docker-compose -f $(DEV_COMPOSE) -p $(PROJECT_NAME) up -d

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
