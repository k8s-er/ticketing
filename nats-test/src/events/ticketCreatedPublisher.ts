import { BasePublisher } from './basePublisher';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticketCreatedEvent';

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreates = Subjects.TicketCreates;
}
