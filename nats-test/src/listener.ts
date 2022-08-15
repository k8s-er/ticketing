import { randomBytes } from 'crypto';
import nats, { Message } from 'node-nats-streaming';

console.clear();

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  stan.on('close', () => {
    console.log('NATS connection closed');
    process.exit();
  });

  const options = stan
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName('tickets-durable-name');

  const subscription = stan.subscribe('ticket:created', 'listenerQueueGroup', options);

  subscription.on('message', (message: Message) => {
    const data = message.getData();

    if (typeof data === 'string') {
      console.log('Received numbner ', message.getSequence(), JSON.parse(data));
    }

    message.ack();
  });
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
