import {
  BaseListener,
  Subjects,
  TicketCreatedEvent,
} from '@hrdev/common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../models/ticket';
import { QUEUE_GROUP_NAME } from './queueGroupName';

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
  subject: Subjects.TicketCreates = Subjects.TicketCreates;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: TicketCreatedEvent['data'],
    msg: Message,
  ) {
    const { title, price, id } = data;
    const ticket = Ticket.build({
      title,
      price,
      id,
    });

    await ticket.save();

    msg.ack();
  }
}
