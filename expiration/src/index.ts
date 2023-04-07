import { OrderCreatedListener } from './events/listeners/orderCreatedListener';
import { natsWrapper } from './natsWrapper';

const start = async () => {
  console.log('starting up expiration...!!');

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

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.error({
      error,
    });
  }
};

start();
