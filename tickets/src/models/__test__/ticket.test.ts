import { Ticket } from '../tickets';

it('implements optimistic concurrency control', async () => {
  // create an instance of ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // save the ticket to the database
  await ticket.save();

  // fetch the ticket twice
  const firstTicket = await Ticket.findById(ticket.id);
  const secondTicket = await Ticket.findById(ticket.id);

  // make two separate changes to tickets
  firstTicket?.set({ price: 10 });
  secondTicket?.set({ price: 15 });

  // save the first fetched ticket
  await firstTicket?.save();

  // save the second fetched ticket
  try {
    await secondTicket?.save();
  } catch (error) {
    return;
  }
  throw new Error('should not reach this point');
});

it('increments the version number', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  // save the ticket to the database
  await ticket.save();

  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
