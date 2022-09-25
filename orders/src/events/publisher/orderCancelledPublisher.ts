import {
  BasePublisher,
  OrderCancelledEvent,
  Subjects,
} from '@hrdev/common';

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled =
    Subjects.OrderCancelled;
}
