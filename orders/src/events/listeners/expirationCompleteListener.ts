import {
  BaseListener,
  ExpirationCompleteEvent,
  OrderStatus,
  Subjects,
} from '@hrdev/common';
import { Message } from 'node-nats-streaming';

import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publisher/orderCancelledPublisher';
import { QUEUE_GROUP_NAME } from './queueGroupName';
QUEUE_GROUP_NAME;

export class ExpirationCompleteListener extends BaseListener<ExpirationCompleteEvent> {
  queueGroupName = QUEUE_GROUP_NAME;
  subject: Subjects.ExpirationComplete =
    Subjects.ExpirationComplete;

  async onMessage(
    data: ExpirationCompleteEvent['data'],
    msg: Message,
  ) {
    const order = await Order.findById(
      data.orderId,
    ).populate('ticket');
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}
