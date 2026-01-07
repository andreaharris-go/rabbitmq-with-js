const amqp = require('amqplib');
const mongoose = require('mongoose');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://root:password@localhost:27017/message-db?authSource=admin';
const TOPIC_NAME = 'messager-topic';

// Define Message Schema
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

let channel;
let connection;

// Connect to MongoDB
async function connectMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    setTimeout(connectMongoDB, 5000);
  }
}

// Connect to RabbitMQ and start consuming
async function connectRabbitMQ() {
  try {
    console.log('Connecting to RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Assert exchange
    await channel.assertExchange(TOPIC_NAME, 'fanout', {
      durable: true
    });
    
    // Create a queue and bind it to the exchange
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, TOPIC_NAME, '');
    
    console.log('Connected to RabbitMQ successfully');
    console.log('Waiting for messages...');
    
    // Consume messages
    channel.consume(q.queue, async (msg) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const data = JSON.parse(content);
          
          console.log('Received message:', data);
          
          // Save to MongoDB
          const newMessage = new Message({
            message: data.message,
            timestamp: new Date(data.timestamp)
          });
          
          await newMessage.save();
          console.log('Message saved to MongoDB:', newMessage);
          
          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject and requeue the message
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    setTimeout(connectRabbitMQ, 5000);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (channel) await channel.close();
  if (connection) await connection.close();
  await mongoose.connection.close();
  process.exit(0);
});

// Start consumer
async function start() {
  await connectMongoDB();
  await connectRabbitMQ();
}

start();
