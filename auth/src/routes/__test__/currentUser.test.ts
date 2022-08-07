import request from 'supertest';

import { app } from '../../app';
import getCookie from '../../test/getCookie';

it('responds with detail about current user', async () => {
  const cookie = await getCookie();
  const responseCurrentUser = await request(app).get('/api/users/currentuser').set('Cookie', cookie).send().expect(200);

  expect(responseCurrentUser.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if user is not authenticated', async () => {
  const responseCurrentUser = await request(app).get('/api/users/currentuser').send().expect(200);

  expect(responseCurrentUser.body.currentUser).toEqual(null);
});
