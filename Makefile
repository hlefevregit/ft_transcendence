# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hulefevr <hulefevr@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/25 18:46:32 by hulefevr          #+#    #+#              #
#    Updated: 2025/02/25 19:45:12 by hulefevr         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


IMAGE_NAME = ft_transcendence
DOCKERFILE = backend/Dockerfile
CONTAINER_NAME = ft_transcendence
PORT = 3000

.PHONY: build run stop re prune

build:
	docker build -f $(DOCKERFILE) -t $(IMAGE_NAME) .

run: build
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):$(PORT) $(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

re: stop build run

prune:
	docker system prune -af
	docker volume prune -f
