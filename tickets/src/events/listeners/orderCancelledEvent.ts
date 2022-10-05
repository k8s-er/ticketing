import {
  BaseListener,
  OrderCancelledEvent,
  Subjects,
} from '@hrdev/common';
import { Message } from 'node-nats-streaming';

import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publisher/ticketUpdatedPublisher';
import { QUEUE_GROUP_NAME } from './queueGroupName';

export class OrderCancelledListener extends BaseListener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled =
    Subjects.OrderCancelled;

  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderCancelledEvent['data'],
    msg: Message,
  ) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // if no ticket, throw error
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting its orderId
    ticket.set({ orderId: undefined });

    // Save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    // ack the message
    msg.ack();
  }
}
