import { Test, TestingModule } from '@nestjs/testing';
import { BudgetRequestsController } from './budget-requests.controller';
import { BudgetRequestsService } from './budget-requests.service';

describe('BudgetRequestsController', () => {
    let controller: BudgetRequestsController;
    let budgetRequestsService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        remove: jest.Mock;
    };

    const mockBudgetRequest = { id: '1', fullName: 'Test User' };

    beforeEach(async () => {
        budgetRequestsService = {
            create: jest.fn().mockResolvedValue(mockBudgetRequest),
            findAll: jest.fn().mockResolvedValue([mockBudgetRequest]),
            findOne: jest.fn().mockResolvedValue(mockBudgetRequest),
            remove: jest.fn().mockResolvedValue(mockBudgetRequest),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BudgetRequestsController],
            providers: [{ provide: BudgetRequestsService, useValue: budgetRequestsService }],
        }).compile();

        controller = module.get<BudgetRequestsController>(BudgetRequestsController);
    });

    // Verifies that the controller forwards the list request to the service.
    it('findAll() delegates to BudgetRequestsService.findAll', async () => {
        const result = await controller.findAll();

        expect(budgetRequestsService.findAll).toHaveBeenCalled();
        expect(result).toEqual([mockBudgetRequest]);
    });

    // Verifies that the controller forwards the lookup request with the id.
    it('findOne() delegates to BudgetRequestsService.findOne with the id', async () => {
        const result = await controller.findOne('1');

        expect(budgetRequestsService.findOne).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockBudgetRequest);
    });

    // Verifies that the controller forwards the create payload and files to the service.
    it('create() delegates to BudgetRequestsService.create with dto and files', async () => {
        const dto = { fullName: 'Test User' } as any;
        const files = {} as any;
        const result = await controller.create(dto, files);

        expect(budgetRequestsService.create).toHaveBeenCalledWith(dto, files);
        expect(result).toEqual(mockBudgetRequest);
    });

    // Verifies that the controller forwards the delete request with the id.
    it('remove() delegates to BudgetRequestsService.remove with the id', async () => {
        const result = await controller.remove('1');

        expect(budgetRequestsService.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockBudgetRequest);
    });
});