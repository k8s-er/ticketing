import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import { natsWrapper } from '../../natsWrapper';
import getCookie from '../../test/getCookie';

it('return a 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const res = await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', await getCookie())
    .send({
      title: 'sdfs',
      price: 20,
    });

  expect(res.statusCode).toEqual(404);
});
it('return a 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const res = await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'sdfs',
      price: 20,
    });

  expect(res.statusCode).toEqual(401);
});
it('return a 401 if user does not own the ticket', async () => {
  const resp = await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: 'new ticket',
      price: 20,
    });

  const resp2 = await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set('Cookie', await getCookie())
    .send({
      title: 'new ticket 1',
      price: 21,
    });

  expect(resp2.statusCode).toEqual(401);
});
it('return a 400 if user provide invalid title or price', async () => {
  const cookie = await getCookie();
  const resp = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'new ticket',
      price: 20,
    });

  const resp2 = await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 21,
    });

  const resp3 = await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'sdfdfsdf',
      price: -10,
    });

  expect(resp2.statusCode).toBe(400);
  expect(resp3.statusCode).toBe(400);
});
it('update the ticket on valid input', async () => {
  const cookie = await getCookie();
  const resp = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'new ticket',
      price: 20,
    });

  const resp2 = await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new ticket 1',
      price: 21,
    });

  expect(resp2.statusCode).toBe(200);

  const resp3 = await request(app)
    .get(`/api/tickets/${resp.body.id}`)
    .send();

  expect(resp3.body.title).toEqual('new ticket 1');
  expect(resp3.body.price).toEqual(21);
});

it('publishes an event', async () => {
  const cookie = await getCookie();

  const resp = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'new ticket',
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new ticket 1',
      price: 21,
    });

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = await getCookie();

  const resp = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'new ticket',
      price: 20,
    });

  const ticket = await Ticket.findById(resp.body.id);
  ticket?.set({
    orderId: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket?.save();

  await request(app)
    .put(`/api/tickets/${resp.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new ticket 1',
      price: 21,
    })
    .expect(400);
});
