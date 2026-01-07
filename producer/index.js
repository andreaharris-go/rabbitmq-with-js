const express = require('express');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 3000;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const TOPIC_NAME = 'messager-topic';

app.use(express.json());

let channel;
let connection;

// Initialize RabbitMQ connection
async function connectRabbitMQ() {
  try {
    console.log('Connecting to RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Assert exchange for topic
    await channel.assertExchange(TOPIC_NAME, 'fanout', {
      durable: true
    });
    
    console.log('Connected to RabbitMQ successfully');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

// POST /message endpoint
app.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!channel) {
      return res.status(503).json({ error: 'RabbitMQ connection not available' });
    }

    // Publish message to RabbitMQ
    const messageData = {
      message,
      timestamp: new Date().toISOString()
    };

    channel.publish(
      TOPIC_NAME,
      '',
      Buffer.from(JSON.stringify(messageData)),
      { persistent: true }
    );

    console.log('Message published:', messageData);
    
    res.status(200).json({
      success: true,
      message: 'Message published successfully',
      data: messageData
    });
  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).json({ error: 'Failed to publish message' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', rabbitmq: !!channel });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (channel) await channel.close();
  if (connection) await connection.close();
  process.exit(0);
});

// Start server
async function start() {
  await connectRabbitMQ();
  
  app.listen(PORT, () => {
    console.log(`Producer API running on port ${PORT}`);
    console.log(`POST http://localhost:${PORT}/message`);
  });
}

start();
