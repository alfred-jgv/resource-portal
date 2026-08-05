import { Test, TestingModule } from '@nestjs/testing';
import { VenueRequestsController } from './venue-requests.controller';
import { VenueRequestsService } from './venue-requests.service';

describe('VenueRequestsController', () => {
    let controller: VenueRequestsController;
    let venueRequestsService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        remove: jest.Mock;
    };

    const mockVenueRequest = { id: '1', clubId: 'club-1' };

    beforeEach(async () => {
        venueRequestsService = {
            create: jest.fn().mockResolvedValue(mockVenueRequest),
            findAll: jest.fn().mockResolvedValue([mockVenueRequest]),
            findOne: jest.fn().mockResolvedValue(mockVenueRequest),
            remove: jest.fn().mockResolvedValue(mockVenueRequest),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [VenueRequestsController],
            providers: [{ provide: VenueRequestsService, useValue: venueRequestsService }],
        }).compile();

        controller = module.get<VenueRequestsController>(VenueRequestsController);
    });

    // Verifies that the controller forwards the list request to the service.
    it('findAll() delegates to VenueRequestsService.findAll', async () => {
        const result = await controller.findAll();

        expect(venueRequestsService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockVenueRequest]);
    });

    // Verifies that the controller forwards the lookup request with the id.
    it('findOne() delegates to VenueRequestsService.findOne with the id', async () => {
        const result = await controller.findOne('1');

        expect(venueRequestsService.findOne).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockVenueRequest);
    });

    // Verifies that the controller forwards the create payload and files to the service.
    it('create() delegates to VenueRequestsService.create with dto and files', async () => {
        const dto = { clubId: 'club-1' } as any;
        const files = {} as any;
        const result = await controller.create(dto, files);

        expect(venueRequestsService.create).toHaveBeenCalledWith(dto, files);
        expect(result).toEqual(mockVenueRequest);
    });

    // Verifies that the controller forwards the delete request with the id.
    it('remove() delegates to VenueRequestsService.remove with the id', async () => {
        const result = await controller.remove('1');

        expect(venueRequestsService.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockVenueRequest);
    });
});