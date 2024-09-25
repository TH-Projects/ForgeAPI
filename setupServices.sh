#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Bitte geben Sie die Anzahl der Server-Instanzen als Parameter an."
    echo "Beispiel: $0 5"
    exit 1
fi

INSTANCE_COUNT=$1

# Erstelle die Docker-Compose-Datei
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Setze Umgebungsvariablen in die Docker-Compose-Datei ein
cat <<EOL > $DOCKER_COMPOSE_FILE
version: '3.8'

services:
  # Datenbank-Container
EOL

for i in $(seq 1 $INSTANCE_COUNT)
do
  cat <<EOL >> $DOCKER_COMPOSE_FILE
  db-${i}:
    image: mariadb:latest
    container_name: db-${i}
    env_file:
      - .env
    volumes:
      - db_data_${i}:/var/lib/mysql
      - ./DB/schema.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "$((5432 + i)):3306"
EOL
done

cat <<EOL >> $DOCKER_COMPOSE_FILE
  # Server-Container
EOL

for i in $(seq 1 $INSTANCE_COUNT)
do
  EXTERNAL_PORT=$((3000 + i))
  cat <<EOL >> $DOCKER_COMPOSE_FILE
  raftnode_${i}:
    image: raftnode
    build: RaftNode
    env_file:
      - .env
    environment:
      - DB_HOST=db-${i}
      - TOTAL_SERVERS=${INSTANCE_COUNT}
      - SERVER_ID=${i}
    ports:
      - "${EXTERNAL_PORT}:3000"
    container_name: raftnode_${i}
EOL
done

cat <<EOL >> $DOCKER_COMPOSE_FILE
volumes:
EOL

for i in $(seq 1 $INSTANCE_COUNT)
do
  cat <<EOL >> $DOCKER_COMPOSE_FILE
  db_data_${i}:
EOL
done

# Starte die Container
docker-compose up -d --build

rm $DOCKER_COMPOSE_FILE

echo "Gestartet: $INSTANCE_COUNT Server-Container und Datenbank-Container"