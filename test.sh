#!/bin/bash
set -e

# Test script for RabbitMQ with Node.js application

echo "Testing the RabbitMQ + Node.js + MongoDB application"
echo "======================================================="
echo ""

# Test 1: Send a message to the producer API
echo "Test 1: Sending a message to the producer API..."
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from test script!"}'
echo ""
echo ""

# Test 2: Send another message
echo "Test 2: Sending another message..."
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"message":"This is a test message"}'
echo ""
echo ""

# Test 3: Health check
echo "Test 3: Checking producer health..."
curl http://localhost:3000/health
echo ""
echo ""

echo "Tests completed!"
echo ""
echo "To verify messages in MongoDB, run:"
echo "docker exec -it mongodb mongosh -u root -p password --authenticationDatabase admin message-db"
echo "Then run: db.messages.find().pretty()"
