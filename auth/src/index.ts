import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  console.log('starting up...!!');
  if (!process.env.JWT_KEY) {
    throw new Error('Env variable "JWT_KEy" not defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('Env variable "MONGO_URI" not defined');
  }

  try {
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
