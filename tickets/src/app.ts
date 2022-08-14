import 'express-async-errors';

import { currentUser, errorHandler, NotFoundError } from '@hrdev/common';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';

import { createTicketRouter } from './routes/createTicket';
import { getTicketsRouter } from './routes/getAllTickets';
import { showTicketRouter } from './routes/getOneTicket';
import { updateTicket } from './routes/updateTicket';

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

app.use(showTicketRouter);

app.use(createTicketRouter);

app.use(getTicketsRouter);

app.use(updateTicket);

app.all('*', async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
