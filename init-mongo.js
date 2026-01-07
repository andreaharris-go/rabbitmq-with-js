// MongoDB initialization script
db = db.getSiblingDB('message-db');

// Create messages collection
db.createCollection('messages');

// Create index on createdAt for better query performance
db.messages.createIndex({ createdAt: -1 });

print('Database message-db initialized successfully');
