FROM docker.elastic.co/elasticsearch/elasticsearch:8.11.1

USER root
COPY ./config/elasticsearch.yml /tmp/elasticsearch.yml
RUN chown elasticsearch:elasticsearch /tmp/elasticsearch.yml \
    && mv /tmp/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

COPY ./config/setup-user.sh /usr/local/bin/setup-user.sh
COPY ./config/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/setup-user.sh /usr/local/bin/entrypoint.sh

USER elasticsearch
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]