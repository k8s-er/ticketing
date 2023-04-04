import {
  BasePublisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@hrdev/common';

export class ExpirationCompletePublisher extends BasePublisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete =
    Subjects.ExpirationComplete;
}
