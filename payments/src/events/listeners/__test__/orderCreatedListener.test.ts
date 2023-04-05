import {
  OrderCreatedEvent,
  OrderStatus,
} from '@hrdev/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Order } from '../../../models/order';
import { natsWrapper } from '../../../natsWrapper';
import { OrderCreatedListener } from '../orderCreatedListener';

const setup = async () => {
  const listener = new OrderCreatedListener(
    natsWrapper.client,
  );

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'alskdjf',
    userId: 'alskdjf',
    status: OrderStatus.Created,
    ticket: {
      id: 'alskdfj',
      price: 10,
    },
  };

  const msg: Message = {
    ack: jest.fn(),
    getSubject: function (): string {
      throw new Error('Function not implemented.');
    },
    getSequence: function (): number {
      throw new Error('Function not implemented.');
    },
    getRawData: function (): Buffer {
      throw new Error('Function not implemented.');
    },
    getData: function (): string | Buffer {
      throw new Error('Function not implemented.');
    },
    getTimestampRaw: function (): number {
      throw new Error('Function not implemented.');
    },
    getTimestamp: function (): Date {
      throw new Error('Function not implemented.');
    },
    isRedelivered: function (): boolean {
      throw new Error('Function not implemented.');
    },
    getCrc32: function (): number {
      throw new Error('Function not implemented.');
    },
  };

  return { listener, data, msg };
};

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
