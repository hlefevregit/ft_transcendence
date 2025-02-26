# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hulefevr <hulefevr@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/26 17:45:30 by hulefevr          #+#    #+#              #
#    Updated: 2025/02/26 17:45:32 by hulefevr         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

# Variables
COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = ft_transcendence

.PHONY: build up down restart logs prune clean rebuild

# Build des images Docker pour tous les services
build:
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build

# Lance les containers en arrière-plan
up:
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d

# Stoppe et supprime les containers
down:
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down

# Restart les containers (ne supprime pas les volumes)
restart:
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d

# Affiche les logs en continu
logs:
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f

# Supprime toutes les images et volumes pour un nettoyage complet
prune:
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --rmi all --remove-orphans
	docker system prune -af
	docker volume prune -f

# Supprime tous les containers, images et volumes Docker
clean:
	docker stop $$(docker ps -aq)
	docker rm $$(docker ps -aq)
	docker rmi -f $$(docker images -aq)
	docker volume rm $$(docker volume ls -q)
	docker network prune -f

# Nouvelle règle: Rebuild propre
rebuild:
	@echo "⛔️ Arrêt de tous les services..."
	-docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --remove-orphans
	@echo "🧹 Nettoyage des images et volumes..."
	docker system prune -af
	docker volume prune -f
	@echo "🔨 Reconstruction des images sans cache..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build --no-cache
	@echo "🚀 Redémarrage des services..."
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d
	@echo "✅ Rebuild complet terminé avec succès !"
