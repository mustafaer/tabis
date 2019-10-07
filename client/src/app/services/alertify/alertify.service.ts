import {Injectable} from '@angular/core';

declare let alertify: any;

@Injectable()
export class AlertifyService {

  constructor() {
  }

  confirm(message: string, okCallback: () => any) {
    alertify.confirm(message, (e) => {
      if (e) {
        okCallback();
      } else {
        // do nothing
      }
    });
  }

  success(message: string) {
    alertify.set('notifier', 'position', 'bottom-right');
    alertify.success(message);
  }

  error(message: string) {
    alertify.set('notifier', 'position', 'bottom-right');
    alertify.error(message);
  }

  warning(message: string) {
    alertify.set('notifier', 'position', 'bottom-right');
    alertify.warning(message);
  }

  message(message: string) {
    alertify.set('notifier', 'position', 'bottom-right');
    alertify.message(message);
  }
}
