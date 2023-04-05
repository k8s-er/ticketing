import { OrderStatus } from '@hrdev/common';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';
import getCookie from '../../test/getCookie';

// jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', await getCookie())
    .send({
      token: 'asdasd',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
  //   const order = await request(app)
  //     .post('/api/orders')
  //     .set('Cookie', await getCookie())
  //     .send({
  //       ticketId: new mongoose.Types.ObjectId().toHexString(),
  //     })
  //     .expect(201);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', await getCookie())
    .send({
      token: 'asdasd',
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId =
    new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', await getCookie(userId))
    .send({
      token: 'asdasd',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 204 with valid inputs', async () => {
  const price = Math.floor(Math.random() * 100000);
  const userId =
    new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 0,
    price: price,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', await getCookie(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const paymentIntentsList = stripe.paymentIntents.list({
    limit: 50,
  });

  const paymentIntent = await (
    await paymentIntentsList
  ).data.find((intent) => intent.amount === price * 100);

  expect(paymentIntent).toBeDefined();
  expect(paymentIntent?.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: paymentIntent?.id,
  });

  expect(payment).not.toBeNull();

  //   const paymentIntentOptions = (
  //     stripe.paymentIntents.create as jest.Mock
  //   ).mock.calls[0][0];

  //   expect(paymentIntentOptions.amount).toEqual(
  //     order.price * 100,
  //   );
  //   expect(paymentIntentOptions.currency).toEqual('usd');

  //   const chargeOptions = (stripe.charges.create as jest.Mock)
  //     .mock.calls[0][0];

  //   expect(chargeOptions.source).toEqual('tok_visa');
  //   expect(chargeOptions.amount).toEqual(20 * 100);
  //   expect(chargeOptions.currency).toEqual('usd');
});
