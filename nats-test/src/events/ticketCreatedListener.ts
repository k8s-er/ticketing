import {
  Subjects,
  TicketCreatedEvent,
} from '@hrdev/common';
import { Message } from 'node-nats-streaming';

import { BaseListener } from '../../../../common/src/events/baseListener';

export class TicketCreatedListener extends BaseListener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreates =
    Subjects.TicketCreates;
  queueGroupName = 'payments-service';

  onMessage(
    data: TicketCreatedEvent['data'],
    msg: Message,
  ) {
    console.log('Event data!', data);

    msg.ack();
  }
}
