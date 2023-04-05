import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@hrdev/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';

import { PaymentCreatedPublisher } from '../events/publishers/paymentCreatedPublisher';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { natsWrapper } from '../natsWrapper';
import { stripe } from '../stripe';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty(),
    body('orderId').not().isEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError(
        'Cannot pay for an cancelled order',
      );
    }

    // await stripe.paymentIntents.create({
    //   currency: 'usd',
    //   amount: order.price * 100,
    //   source: token,
    // });

    // Handle it differently for india
    const intent = await stripe.paymentIntents.create({
      amount: order.price * 100,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    const payment = Payment.build({
      orderId,
      stripeId: intent.id,
    });

    await payment.save();

    await new PaymentCreatedPublisher(
      natsWrapper.client,
    ).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ id: payment.id });
  },
);

export { router as createChargeRouter };
