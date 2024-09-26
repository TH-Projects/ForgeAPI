#!/bin/bash

# Check if the required number of arguments is provided
if [ $# -lt 2 ]; then
    echo "Please provide the number of server instances and the file path as parameters."
    echo "Example: $0 5 ./path/to/file.forgeapi"
    exit 1
fi

INSTANCE_COUNT=$1
FILE_PATH=$2

# Check if the file path exists
if [ ! -f "$FILE_PATH" ]; then
    echo "Error: The file $FILE_PATH does not exist."
    exit 1
fi

# Execute the compiler script with the provided file path
if ! python3 ./Compiler/forgeapi_compiler.py "$FILE_PATH"; then
    echo "Error: The Python script failed to run."
    exit 1
fi

# Create the Docker Compose file
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Set environment variables in the Docker Compose file
cat <<EOL > $DOCKER_COMPOSE_FILE

services:
  # Database containers
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
  # Server containers
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

# Start the containers
docker-compose up -d --build

# Remove the Docker Compose file
rm $DOCKER_COMPOSE_FILE

echo "Started: $INSTANCE_COUNT server containers and database containers"
