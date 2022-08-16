import { BasePublisher, Subjects, TicketCreatedEvent } from '@hrdev/common';

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreates = Subjects.TicketCreates;
}
