import {
  OrderCreatedEvent,
  OrderStatus,
} from '@hrdev/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../natsWrapper';
import { OrderCreatedListener } from '../orderCreatedListener';

const setup = async () => {
  // create an instance of listener
  const listener = new OrderCreatedListener(
    natsWrapper.client,
  );

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'sdf',
  });

  await ticket.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'sdfsdd',
    expiresAt: 'esdfds',
    ticket: {
      id: ticket.id,
      price: ticket.price,
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

  return {
    listener,
    ticket,
    data,
    msg,
  };
};

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toEqual(data.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it(' publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdateData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock
      .calls[0][1],
  );

  expect(data.id).toEqual(ticketUpdateData.orderId);
});
