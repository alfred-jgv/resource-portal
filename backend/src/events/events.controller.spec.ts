import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
    let controller: EventsController;
    let eventsService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        remove: jest.Mock;
    };

    const mockEvent = { id: '1', eventName: 'Annual Summit' };

    beforeEach(async () => {
        eventsService = {
            create: jest.fn().mockResolvedValue(mockEvent),
            findAll: jest.fn().mockResolvedValue([mockEvent]),
            findOne: jest.fn().mockResolvedValue(mockEvent),
            remove: jest.fn().mockResolvedValue(mockEvent),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [{ provide: EventsService, useValue: eventsService }],
        }).compile();

        controller = module.get<EventsController>(EventsController);
    });

    // Verifies that the controller forwards the list request to the service.
    it('findAll() delegates to EventsService.findAll', async () => {
        const result = await controller.findAll();

        expect(eventsService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockEvent]);
    });

    // Verifies that the controller forwards the lookup request with the id.
    it('findOne() delegates to EventsService.findOne with the id', async () => {
        const result = await controller.findOne('1');

        expect(eventsService.findOne).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockEvent);
    });

    // Verifies that the controller forwards the create payload to the service.
    it('create() delegates to EventsService.create with the dto', async () => {
        const dto = { eventName: 'Annual Summit' } as any;
        const result = await controller.create(dto);

        expect(eventsService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockEvent);
    });

    // Verifies that the controller forwards the delete request with the id.
    it('remove() delegates to EventsService.remove with the id', async () => {
        const result = await controller.remove('1');

        expect(eventsService.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockEvent);
    });
});