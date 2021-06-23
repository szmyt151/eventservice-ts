import { EventsService } from '../events.service';
import { Event } from '../../models/event';
import { v4 } from 'uuid';

/* eslint-disable */
export class EventsMockService implements EventsService {
  constructor(private _events: Event[]) {}

  dateWithoutTimezone(date: string): Date {
    var dateTimezone = new Date(date);
    return new Date(dateTimezone.getTime() - dateTimezone.getTimezoneOffset() * 60000);
  }

  async validate(event: Event): Promise<boolean> {
    if (!event.title || !event.startDate || !event.endDate) {
      throw new Error('Event has not required fields');
    }

    return this.getEvents(event.startDate, event.endDate, 0, this._events.length).then(({ events }) => {
      events = events.filter((e) => {
        if (this.dateWithoutTimezone(event.startDate).getTime() >= this.dateWithoutTimezone(e.endDate).getTime()) {
          return true;
        }
        return false;
      });

      if (events.length > 0) {
        throw new Error('Event time is conflicted');
      }
      return true;
    });
  }

  createEvent(dateFrom: string, dateTo: string, title: string): Promise<Event> {
    // @ts-ignore
    const event: Event = { id: v4(), startDate: dateFrom, endDate: dateTo, title: title };

    return this.validate(event).then(() => {
      this._events.push(event);
      return Promise.resolve(event); // todo: implement method
    });
  }

  getEvent(id: string): Promise<Event> {
    // @ts-ignore
    return new Promise((resolve, reject) => {
      const event: Event = this._events.find((event) => event.id === id);

      if (event) return resolve(event);

      reject(new Error('Event with specified id not found'));
    });
  }

  getEvents(
    dateFrom: string,
    dateTo: string,
    offset: number,
    limit: number,
  ): Promise<{ totalCount: number; events: Event[] }> {
    let events = this._events.filter((event) => {
      if (
        this.dateWithoutTimezone(event.startDate).getTime() >= this.dateWithoutTimezone(dateFrom).getTime() &&
        this.dateWithoutTimezone(event.endDate).getTime() <= this.dateWithoutTimezone(dateTo).getTime()
      ) {
        return true;
      }
      return false;
    });

    const paginatedItems: Event[] = events.slice(offset * limit).slice(0, limit);
    // @ts-ignore
    return Promise.resolve({ totalCount: paginatedItems.length, events: paginatedItems });
  }

  removeEvent(id: string): Promise<string> {
    // @ts-ignore
    const event = this._events.find((event) => event.id === id);

    if (event) {
      this._events = this._events.filter((event) => event.id !== id);
      return Promise.resolve(id);
    }
    throw new Error('Event with specified id not found');
  }
}
