import {
  BasePublisher,
  Subjects,
  TicketUpdatedEvent,
} from '@hrdev/common';

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent> {
  readonly subject: Subjects.TicketUpdated =
    Subjects.TicketUpdated;
}
