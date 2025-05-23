# Dockerfile.kibana
FROM docker.elastic.co/kibana/kibana:8.11.1

COPY ./config/kibana.yml /usr/share/kibana/config/kibana.yml

USER root
RUN chown -R kibana:kibana /usr/share/kibana/config/kibana.yml
USER kibana