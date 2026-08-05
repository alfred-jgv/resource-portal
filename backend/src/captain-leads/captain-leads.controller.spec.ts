import { Test, TestingModule } from '@nestjs/testing';
import { CaptainLeadsController } from './captain-leads.controller';
import { CaptainLeadsService } from './captain-leads.service';

describe('CaptainLeadsController', () => {
    let controller: CaptainLeadsController;
    let captainLeadsService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        remove: jest.Mock;
    };

    const mockCaptainLead = { id: '1', firstName: 'Jane', lastName: 'Doe' };

    beforeEach(async () => {
        captainLeadsService = {
            create: jest.fn().mockResolvedValue(mockCaptainLead),
            findAll: jest.fn().mockResolvedValue([mockCaptainLead]),
            findOne: jest.fn().mockResolvedValue(mockCaptainLead),
            remove: jest.fn().mockResolvedValue(mockCaptainLead),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CaptainLeadsController],
            providers: [{ provide: CaptainLeadsService, useValue: captainLeadsService }],
        }).compile();

        controller = module.get<CaptainLeadsController>(CaptainLeadsController);
    });

    // Verifies that the controller forwards the list request to the service.
    it('findAll() delegates to CaptainLeadsService.findAll', async () => {
        const result = await controller.findAll();

        expect(captainLeadsService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockCaptainLead]);
    });

    // Verifies that the controller forwards the lookup request with the id.
    it('findOne() delegates to CaptainLeadsService.findOne with the id', async () => {
        const result = await controller.findOne('1');

        expect(captainLeadsService.findOne).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockCaptainLead);
    });

    // Verifies that the controller forwards the create payload to the service.
    it('create() delegates to CaptainLeadsService.create with the dto', async () => {
        const dto = { firstName: 'Jane', lastName: 'Doe', clubId: 'club-id' } as any;
        const result = await controller.create(dto);

        expect(captainLeadsService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockCaptainLead);
    });

    // Verifies that the controller forwards the delete request with the id.
    it('remove() delegates to CaptainLeadsService.remove with the id', async () => {
        const result = await controller.remove('1');

        expect(captainLeadsService.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockCaptainLead);
    });
});