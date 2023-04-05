import {
  BaseListener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@hrdev/common';
import { Message } from 'node-nats-streaming';

import { Order } from '../../models/order';
import { QUEUE_GROUP_NAME } from './queueGroupName';

export class PaymentCreatedListener extends BaseListener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated =
    Subjects.PaymentCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(
    data: PaymentCreatedEvent['data'],
    msg: Message,
  ) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    msg.ack();
  }
}
