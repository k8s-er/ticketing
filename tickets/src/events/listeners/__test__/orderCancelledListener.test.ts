import { OrderCancelledEvent } from '@hrdev/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../natsWrapper';
import { OrderCancelledListener } from '../orderCancelledEvent';

const setup = async () => {
  // create an instance of listener
  const listener = new OrderCancelledListener(
    natsWrapper.client,
  );

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'sdf',
  });

  const orderId =
    new mongoose.Types.ObjectId().toHexString();

  ticket.set({ orderId });

  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
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
    orderId,
  };
};

it('updates the ticket, publish an event and acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
