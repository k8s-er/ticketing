import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/tickets';
import getCookie from '../../test/getCookie';

it('has a route handler listening to /api/ticket for post request', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('can only be access when authenticate', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('return a status other than 401 if user is logged in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns error if invalid title is provided', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: '',
      price: 23,
    });
  expect(response.status).toEqual(400);

  const response2 = await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      price: 23,
    });
  expect(response2.status).toEqual(400);
});
it('returns error if invalid price is provided', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: 'new title',
      price: -122,
    });
  expect(response.status).toEqual(400);

  const response2 = await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: 'new title',
    });
  expect(response2.status).toEqual(400);
});
it('create the ticket with right inputs', async () => {
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: 'new ticket',
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(20);
});
