#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Bitte geben Sie die Anzahl der Server-Instanzen als Parameter an."
    echo "Beispiel: $0 5"
    exit 1
fi

INSTANCE_COUNT=$1

echo "Starte Datenbank-Container"

# Starte die Datenbank-Container
#docker-compose -f docker-compose.db.yml up -d

# Erstelle eine temporäre Docker-Compose-Datei für die Server-Instanzen
SERVER_COMPOSE_FILE="docker-compose.server.yml"

# Setze Umgebungsvariablen für die Server-Instanzen
echo "version: '3.8'" >> $SERVER_COMPOSE_FILE
echo "services:" >> $SERVER_COMPOSE_FILE


for i in $(seq 1 $INSTANCE_COUNT)
do
  EXTERNAL_PORT=$((3000 + i))
  echo "  raftnode_${i}:" >> $SERVER_COMPOSE_FILE
  echo "    image: raftnode" >> $SERVER_COMPOSE_FILE
  echo "    build: RaftNode" >> $SERVER_COMPOSE_FILE
  echo "    environment:" >> $SERVER_COMPOSE_FILE
  echo "      - DB_HOST=db-${i}" >> $SERVER_COMPOSE_FILE
  echo "      - TOTAL_SERVERS=${INSTANCE_COUNT}" >> $SERVER_COMPOSE_FILE
  echo "      - SERVER_ID=${i}" >> $SERVER_COMPOSE_FILE
  echo "    ports:" >> $SERVER_COMPOSE_FILE
  echo "      - \"${EXTERNAL_PORT}:3000\"" >> $SERVER_COMPOSE_FILE
  echo "    container_name: raftnode_${i}" >> $SERVER_COMPOSE_FILE
  echo "    networks:" >> $SERVER_COMPOSE_FILE
  echo "      - my-network" >> $SERVER_COMPOSE_FILE
done
echo "networks:" >> $SERVER_COMPOSE_FILE
echo "  my-network:" >> $SERVER_COMPOSE_FILE
# Starte die Server-Container
echo "Starte Server-Container"
docker-compose -f $SERVER_COMPOSE_FILE up -d --build

# Lösche die temporäre Docker-Compose-Datei
rm $SERVER_COMPOSE_FILE

echo "Gestartet: $INSTANCE_COUNT Server-Container und Datenbank-Container"