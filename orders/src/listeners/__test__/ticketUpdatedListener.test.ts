import { TicketUpdatedEvent } from '@hrdev/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../natsWrapper';
import { TicketUpdatedListener } from '../ticketUpdatedListener';

const setup = async () => {
  // create a listener object
  const listener = new TicketUpdatedListener(
    natsWrapper.client,
  );

  const ticketId =
    new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    id: ticketId,
    title: 'show',
    price: 100,
  });

  await ticket.save();

  //create a fake data
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: 1,
    title: 'show name changed',
    price: 110,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message
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

  return { listener, data, msg, ticket };
};

it('finds, updates and saves the ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with the data object
  await listener.onMessage(data, msg);

  // assertions
  const refetchedTicket = await Ticket.findById(ticket.id);

  expect(refetchedTicket?.price).toEqual(data.price);
  expect(refetchedTicket?.title).toEqual(data.title);
  expect(refetchedTicket?.version).toEqual(data.version);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if out of order events', async () => {
  const { listener, data, msg } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
