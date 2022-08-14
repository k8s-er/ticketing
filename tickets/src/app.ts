import 'express-async-errors';

import { currentUser, errorHandler, NotFoundError } from '@hrdev/common';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';

import { createTicketRouter } from './routes/newTicket';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  }),
);

app.use(currentUser);

app.use(createTicketRouter);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
