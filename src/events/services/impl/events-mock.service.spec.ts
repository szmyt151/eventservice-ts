import { EventsService } from '../events.service';
import { EventsMockService } from './events-mock.service';
import { EventsMockData } from '../../mock-data/event';

describe('EventsMockService', () => {
  let eventsService: EventsService;

  const event = {
    dateFrom: new Date("2022-12-31T20:00:00").toISOString(), 
    dateTo: new Date("2022-12-31T21:00:00").toISOString(), 
    title: "My new Event"
  }

  const conflictedEvent = {
    dateFrom: new Date("2021-12-31T18:00:00").toISOString(), 
    dateTo: new Date("2021-12-31T20:00:00").toISOString(), 
    title: "Conflicted Event"
  }

  const conflictedStartTimeEvent = {
    dateFrom: new Date("2021-12-31T20:00:00").toISOString(), 
    dateTo: new Date("2021-12-31T22:00:00").toISOString(), 
    title: "Conflicted Start Time Event"
  }

  beforeEach(() => {
    eventsService = new EventsMockService([...EventsMockData]);
  });

  describe('createEvent()', () => {
    it('is defined of type function', async () => {
      expect(eventsService.createEvent).toBeDefined();
      expect(typeof eventsService.createEvent).toBe('function');
    });

    it('is creating event ', async () => {
        const createdEvent = await eventsService.createEvent(event.dateFrom, event.dateTo, event.title);
        expect(createdEvent.title).toBe(event.title);
        expect(createdEvent.startDate).toBe(event.dateFrom);
        expect(createdEvent.endDate).toBe(event.dateTo);
    })

    it('is not creating event without [title]', async () => {
      try {
        await eventsService.createEvent(event.dateFrom, event.dateTo, null);
      } catch (error) {
        expect(error.toString()).toBe("Error: Event has not required fields");
      }
    })
    it('is not creating event without [dateFrom]', async () => {
      try {
        await eventsService.createEvent(null, event.dateTo, event.title);
      } catch (error) {
        expect(error.toString()).toBe("Error: Event has not required fields");
      }
    })
    it('is not creating event without [dateTo]', async () => {
      try {
        await eventsService.createEvent(event.dateFrom, null, event.title);
      } catch (error) {
        expect(error.toString()).toBe("Error: Event has not required fields");
      }
    })

    it('is not creating event because conflicting time [startTime, endTime]', async () => {
      try {
        await eventsService.createEvent(conflictedEvent.dateFrom, conflictedEvent.dateTo, conflictedEvent.title);
      } catch (error) {
        expect(error.toString()).toBe("Error: Event time is conflicted");
      }
    })
    
    it('is createing event with the same start time as the previous one\'s end time', async () => {      
      try {
        await eventsService.createEvent(conflictedStartTimeEvent.dateFrom, conflictedStartTimeEvent.dateTo, conflictedStartTimeEvent.title);
      } catch (error) {
        expect(error.toString()).toBe("Error: Event time is conflicted");
      }

    })
  });

  describe('getEvent()', () => {
    it('is defined of type function', () => {
      expect(eventsService.getEvent).toBeDefined();
      expect(typeof eventsService.getEvent).toBe('function');
    });

    it('get event by id', async () => {
      const mockedEvent = EventsMockData[0];
      const event = await eventsService.getEvent(mockedEvent.id);

      expect(event.id).toBe(mockedEvent.id);
      expect(event.title).toBe(mockedEvent.title);
    })

    it('get event by wrong id', async () => {
      try {
        await eventsService.getEvent("wrongID");
      } catch (error) {
        expect(error.toString()).toBe("Error: Event with specified id not found");
      }
    })
  });

  describe('getEvents()', () => {
    it('is defined of type function', () => {
      expect(eventsService.getEvents).toBeDefined();
      expect(typeof eventsService.getEvents).toBe('function');
    });

    it('get past events ', async () => {
      const events = await eventsService.getEvents( new Date("2021-01-01").toISOString(), new Date("2021-01-31").toISOString(), 0, 10);
      expect(events.totalCount).toBe(10);
    })

    it('get current events ', async () => {
      const events = await eventsService.getEvents( new Date("2021-06-23").toISOString(), new Date("2021-06-24").toISOString(), 0, 10);
      expect(events.totalCount).toBe(3);
    })

    it('get future events ', async () => {
      const events = await eventsService.getEvents( new Date().toISOString(), new Date(`${new Date().getUTCFullYear()+1}`).toISOString(), 0, 10);
      expect(events.totalCount).toBe(10);

    })
  });

  describe('removeEvent()', () => {
    it('is defined of type function', () => {
      expect(eventsService.removeEvent).toBeDefined();
      expect(typeof eventsService.removeEvent).toBe('function');
    });

    it('remove event', async () => {
      const mockedEvent = EventsMockData[0];
      const removedID = await eventsService.removeEvent(mockedEvent.id);
      expect(removedID).toBe(mockedEvent.id);
    })

    it('remove event with wronng ID', async () => {
      try {
        const removedID = await eventsService.removeEvent("wrongID");
      } catch (error) {
        expect(error.toString()).toBe("Error: Event with specified id not found");
      }
    })
  });
});
