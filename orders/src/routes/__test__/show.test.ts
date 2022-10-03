import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import getCookie from '../../test/getCookie';

it('shows the order', async () => {
  // create a ticket

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const user = getCookie();

  // make a request to build an order with this ticket

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  // make request to fetch the order

  const { body: showOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(showOrder.id).toEqual(order.id);
});

it('returns the error', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const user = getCookie();
  const userTwo = getCookie();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});
