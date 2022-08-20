import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './natsWrapper';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('Env variable "JWT_KEy" not defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('Env variable "MONGO_URI" not defined');
  }

  try {
    await natsWrapper.connect(
      'ticketing',
      'sdddfs',
      'http://nats-srv:4222',
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI);
    console.log('connected to mongo');
  } catch (error) {
    console.error({
      error,
    });
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start();
