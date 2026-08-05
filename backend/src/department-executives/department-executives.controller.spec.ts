import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentExecutivesController } from './department-executives.controller';
import { DepartmentExecutivesService } from './department-executives.service';

describe('DepartmentExecutivesController', () => {
    let controller: DepartmentExecutivesController;
    let departmentExecutivesService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        remove: jest.Mock;
    };

    const mockDepartmentExecutive = { id: '1', firstName: 'Alex', lastName: 'Reyes' };

    beforeEach(async () => {
        departmentExecutivesService = {
            create: jest.fn().mockResolvedValue(mockDepartmentExecutive),
            findAll: jest.fn().mockResolvedValue([mockDepartmentExecutive]),
            findOne: jest.fn().mockResolvedValue(mockDepartmentExecutive),
            remove: jest.fn().mockResolvedValue(mockDepartmentExecutive),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [DepartmentExecutivesController],
            providers: [{ provide: DepartmentExecutivesService, useValue: departmentExecutivesService }],
        }).compile();

        controller = module.get<DepartmentExecutivesController>(DepartmentExecutivesController);
    });

    // Verifies that the controller forwards the list request to the service.
    it('findAll() delegates to DepartmentExecutivesService.findAll', async () => {
        const result = await controller.findAll();

        expect(departmentExecutivesService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockDepartmentExecutive]);
    });

    // Verifies that the controller forwards the lookup request with the id.
    it('findOne() delegates to DepartmentExecutivesService.findOne with the id', async () => {
        const result = await controller.findOne('1');

        expect(departmentExecutivesService.findOne).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockDepartmentExecutive);
    });

    // Verifies that the controller forwards the create payload to the service.
    it('create() delegates to DepartmentExecutivesService.create with the dto', async () => {
        const dto = { firstName: 'Alex', lastName: 'Reyes', clubId: 'club-id' } as any;
        const result = await controller.create(dto);

        expect(departmentExecutivesService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockDepartmentExecutive);
    });

    // Verifies that the controller forwards the delete request with the id.
    it('remove() delegates to DepartmentExecutivesService.remove with the id', async () => {
        const result = await controller.remove('1');

        expect(departmentExecutivesService.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockDepartmentExecutive);
    });
});