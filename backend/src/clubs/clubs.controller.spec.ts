import { Test, TestingModule } from '@nestjs/testing';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

describe('ClubsController', () => {
    let controller: ClubsController;
    let clubsService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        remove: jest.Mock;
    };

    const mockClub = { id: '1', clubName: 'Test Builders Club' };

    beforeEach(async () => {
        clubsService = {
            create: jest.fn().mockResolvedValue(mockClub),
            findAll: jest.fn().mockResolvedValue([mockClub]),
            findOne: jest.fn().mockResolvedValue(mockClub),
            remove: jest.fn().mockResolvedValue(mockClub),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ClubsController],
            providers: [{ provide: ClubsService, useValue: clubsService }],
        }).compile();

        controller = module.get<ClubsController>(ClubsController);
    });

    it('findAll() delegates to ClubsService.findAll', async () => {
        const result = await controller.findAll();

        expect(clubsService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockClub]);
    });

    it('findOne() delegates to ClubsService.findOne with the id', async () => {
        const result = await controller.findOne('1');

        expect(clubsService.findOne).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockClub);
    });

    it('create() delegates to ClubsService.create with the dto', async () => {
        const dto = { clubName: 'Test Builders Club' } as any;
        const result = await controller.create(dto);

        expect(clubsService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockClub);
    });

    it('remove() delegates to ClubsService.remove with the id', async () => {
        const result = await controller.remove('1');

        expect(clubsService.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockClub);
    });
});