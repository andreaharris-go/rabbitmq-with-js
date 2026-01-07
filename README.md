# RabbitMQ with Node.js, Docker Compose & MongoDB

A complete example of a microservices architecture using RabbitMQ as a message broker, Node.js for producer and consumer services, and MongoDB for data persistence.

## Architecture

- **Producer (API)**: RESTful API that receives HTTP POST requests and publishes messages to RabbitMQ
- **RabbitMQ**: Message broker that handles message distribution
- **Consumer**: Background service that consumes messages from RabbitMQ and stores them in MongoDB
- **MongoDB**: Database for persisting messages

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

## Quick Start

### 1. Start all services with Docker Compose

```bash
docker-compose up -d
```

This will start:
- RabbitMQ (ports 5672, 15672)
- MongoDB (port 27017)
- Producer API (port 3000)
- Consumer service

### 2. Verify services are running

```bash
docker-compose ps
```

### 3. Test the API

Send a message to the producer API:

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello RabbitMQ!"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Message published successfully",
  "data": {
    "message": "Hello RabbitMQ!",
    "timestamp": "2024-01-07T10:30:00.000Z"
  }
}
```

### 4. Check RabbitMQ Management UI

Open http://localhost:15672 in your browser
- Username: `guest`
- Password: `guest`

### 5. Verify data in MongoDB

```bash
docker exec -it mongodb mongosh -u root -p password --authenticationDatabase admin message-db

# Then run:
db.messages.find().pretty()
```

## Local Development

### Install dependencies

```bash
npm install
```

### Run producer locally

```bash
npm run dev:producer
```

### Run consumer locally

```bash
npm run dev:consumer
```

## API Documentation

### POST /message

Publishes a message to RabbitMQ topic `messager-topic`.

**Request:**
```json
{
  "message": "Your message here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Message published successfully",
  "data": {
    "message": "Your message here",
    "timestamp": "2024-01-07T10:30:00.000Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Message is required"
}
```

### GET /health

Health check endpoint for the producer service.

**Response (200 OK):**
```json
{
  "status": "OK",
  "rabbitmq": true
}
```

## Configuration

Environment variables can be configured in the `docker-compose.yml` file:

### RabbitMQ
- `RABBITMQ_DEFAULT_USER`: Default username (default: guest)
- `RABBITMQ_DEFAULT_PASS`: Default password (default: guest)

### MongoDB
- `MONGO_INITDB_DATABASE`: Initial database name (default: message-db)
- `MONGO_INITDB_ROOT_USERNAME`: Root username (default: root)
- `MONGO_INITDB_ROOT_PASSWORD`: Root password (default: password)

### Producer
- `RABBITMQ_URL`: RabbitMQ connection URL
- `PORT`: API server port (default: 3000)

### Consumer
- `RABBITMQ_URL`: RabbitMQ connection URL
- `MONGODB_URL`: MongoDB connection URL

## Project Structure

```
.
├── docker-compose.yml          # Docker Compose configuration
├── init-mongo.js              # MongoDB initialization script
├── package.json               # Node.js dependencies
├── Dockerfile.producer        # Producer service Dockerfile
├── Dockerfile.consumer        # Consumer service Dockerfile
├── producer/
│   └── index.js              # Producer API implementation
└── consumer/
    └── index.js              # Consumer service implementation
```

## Stopping Services

```bash
docker-compose down
```

To remove volumes as well:

```bash
docker-compose down -v
```

## Troubleshooting

### Check service logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f producer
docker-compose logs -f consumer
docker-compose logs -f rabbitmq
docker-compose logs -f mongodb
```

### Restart a specific service

```bash
docker-compose restart producer
docker-compose restart consumer
```

## License

ISC