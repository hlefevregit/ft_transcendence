# Dockerfile.kibana
FROM docker.elastic.co/kibana/kibana:8.11.1

COPY ./config/kibana.yml /usr/share/kibana/config/kibana.yml

USER root
RUN chown -R kibana:kibana /usr/share/kibana/config/kibana.yml

RUN apt-get update && apt-get install -y \
	curl \
	jq \
	&& rm -rf /var/lib/apt/lists/*

COPY ./config/entrypoint.sh /bin/entrypoint.sh
RUN chmod +x /bin/entrypoint.sh

ENTRYPOINT ["/bin/entrypoint.sh"]

USER kibana
