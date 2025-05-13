FROM docker.elastic.co/beats/filebeat:8.11.1

COPY filebeat.yml /usr/share/filebeat/filebeat.yml

USER root
RUN chown root:filebeat /usr/share/filebeat/filebeat.yml && chmod 644 /usr/share/filebeat/filebeat.yml

USER filebeat