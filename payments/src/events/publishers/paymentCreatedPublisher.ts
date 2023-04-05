import {
  BasePublisher,
  PaymentCreatedEvent,
  Subjects,
} from '@hrdev/common';

export class PaymentCreatedPublisher extends BasePublisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated =
    Subjects.PaymentCreated;
}
