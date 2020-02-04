export class RequestPayload {
  limit: number;
  valueOfSearch: string;
  orderByValue: string;

  constructor() {
    this.limit = 15;
    this.valueOfSearch = '';
    this.orderByValue = 'id';
  }
}
