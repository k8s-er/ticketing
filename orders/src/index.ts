import mongoose from 'mongoose';

import { app } from './app';
import { ExpirationCompleteListener } from './events/listeners/expirationCompleteListener';
import { PaymentCreatedListener } from './events/listeners/paymentCreatedListener';
import { TicketCreatedListener } from './events/listeners/ticketCreatedListener';
import { TicketUpdatedListener } from './events/listeners/ticketUpdatedListener';
import { natsWrapper } from './natsWrapper';

const start = async () => {
  console.log('starting up orders...!!');
  if (!process.env.JWT_KEY) {
    throw new Error('Env variable "JWT_KEy" not defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('Env variable "MONGO_URI" not defined');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error(
      'Env variable "NATS_CLIENT_ID" not defined',
    );
  }

  if (!process.env.NATS_URL) {
    throw new Error('Env variable "NATS_URL" not defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error(
      'Env variable "NATS_CLUSTER_ID" not defined',
    );
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL,
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(
      natsWrapper.client,
    ).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

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
