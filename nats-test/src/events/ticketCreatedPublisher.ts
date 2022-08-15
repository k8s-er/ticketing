import {
  BasePublisher,
  Subjects,
  TicketCreatedEvent,
} from '@hrdev/common';
export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreates = Subjects.TicketCreates;
}
