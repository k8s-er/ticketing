import {
  ExpirationCompleteEvent,
  OrderStatus,
} from '@hrdev/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../natsWrapper';
import { ExpirationCompleteListener } from '../expirationCompleteListener';

const setup = async () => {
  const listener = new ExpirationCompleteListener(
    natsWrapper.client,
  );
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    ticket: ticket,
    expiresAt: new Date(),
    userId: 'asdf',
    status: OrderStatus.Created,
  });

  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
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

  return {
    listener,
    order,
    ticket,
    data,
    msg,
  };
};

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(
    OrderStatus.Cancelled,
  );
});

it('emits an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock
      .calls[0][1],
  );

  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
