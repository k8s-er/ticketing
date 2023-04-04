import {
  BaseListener,
  OrderCreatedEvent,
  Subjects,
} from '@hrdev/common';
import { Message } from 'node-nats-streaming';

import { expirationQueue } from '../../queues/expirationQueue';
import { QUEUE_GROUP_NAME } from './queueGroupName';

export class OrderCreatedListener extends BaseListener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;

  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message,
  ) {
    const delay =
      new Date(data.expiresAt).getTime() -
      new Date().getTime();

    console.log(
      'Waiting this many milliseconds to process the job:',
      delay,
    );

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: 10 * 1000,
      },
    );

    msg.ack();
  }
}
