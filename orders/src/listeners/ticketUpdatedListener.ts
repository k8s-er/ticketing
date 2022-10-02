import {
  BaseListener,
  Subjects,
  TicketUpdatedEvent,
} from '@hrdev/common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../models/ticket';
import { QUEUE_GROUP_NAME } from './queueGroupName';

export class TicketCreatedListener extends BaseListener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: TicketUpdatedEvent['data'],
    msg: Message,
  ) {
    const ticket = await Ticket.findById(data.id);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const { title, price } = data;
    ticket.set({ title, price });

    await ticket.save();

    msg.ack();
  }
}
