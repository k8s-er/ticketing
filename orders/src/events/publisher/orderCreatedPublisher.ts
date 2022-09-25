import {
  BasePublisher,
  OrderCreatedEvent,
  Subjects,
} from '@hrdev/common';

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
