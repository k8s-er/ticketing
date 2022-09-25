import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@hrdev/common';
import express, { Request, Response } from 'express';

import { OrderCancelledPublisher } from '../events/publisher/orderCancelledPublisher';
import { Order, OrderStatus } from '../models/order';
import { natsWrapper } from '../natsWrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(
      req.params.orderId,
    ).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish(
      {
        id: order.id,
        ticket: {
          id: order.ticket.id,
        },
      },
    );

    res.status(204).send(order);
  },
);

export { router as deleteOrderRouter };
