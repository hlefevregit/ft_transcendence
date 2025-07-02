FROM docker.elastic.co/logstash/logstash:8.11.1

COPY ./pipeline/logstash.conf /usr/share/logstash/pipeline/logstash.conf

USER root

COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]