import request from 'supertest';

import { app } from '../../app';
import getCookie from '../../test/getCookie';

it('should fetch the tickets', async () => {
  const title1 = 'concert';
  const price1 = 20;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: title1,
      price: price1,
    });

  const title2 = 'concert2';
  const price2 = 10;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: title2,
      price: price2,
    });

  const title3 = 'concert2';
  const price3 = 10;
  await request(app)
    .post('/api/tickets')
    .set('Cookie', await getCookie())
    .send({
      title: title3,
      price: price3,
    });

  const response = await request(app)
    .get('/api/tickets')
    .send();

  expect(response.statusCode).toEqual(200);
  expect(response.body.length).toEqual(3);
});
