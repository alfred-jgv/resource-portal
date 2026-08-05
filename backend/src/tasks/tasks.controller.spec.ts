import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
    let controller: TasksController;
    let tasksService: {
        create: jest.Mock;
        findAll: jest.Mock;
        findOne: jest.Mock;
        update: jest.Mock;
        remove: jest.Mock;
    };

    const mockTask = { id: '1', taskName: 'Prepare docs', assignedOffice: 'WORKFORCE' };

    beforeEach(async () => {
        tasksService = {
            create: jest.fn().mockResolvedValue(mockTask),
            findAll: jest.fn().mockResolvedValue([mockTask]),
            findOne: jest.fn().mockResolvedValue(mockTask),
            update: jest.fn().mockResolvedValue(mockTask),
            remove: jest.fn().mockResolvedValue(mockTask),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [{ provide: TasksService, useValue: tasksService }],
        }).compile();

        controller = module.get<TasksController>(TasksController);
    });

    // Verifies that the controller forwards role-based list requests to the service.
    it('findAll() delegates to TasksService.findAll with current user role', async () => {
        const result = await controller.findAll({ user: { role: 'WORKFORCE' } });

        expect(tasksService.findAll).toHaveBeenCalledWith('WORKFORCE');
        expect(result).toEqual([mockTask]);
    });

    // Verifies that the controller forwards lookup requests with id and role.
    it('findOne() delegates to TasksService.findOne with id and role', async () => {
        const result = await controller.findOne('1', { user: { role: 'WORKFORCE' } });

        expect(tasksService.findOne).toHaveBeenCalledWith('1', 'WORKFORCE');
        expect(result).toEqual(mockTask);
    });

    // Verifies that the controller forwards create payloads to the service.
    it('create() delegates to TasksService.create with the dto', async () => {
        const dto = { taskName: 'Prepare docs' } as any;
        const result = await controller.create(dto);

        expect(tasksService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockTask);
    });

    // Verifies that the controller forwards update payloads with id.
    it('update() delegates to TasksService.update with id and dto', async () => {
        const dto = { status: 'DONE' } as any;
        const result = await controller.update('1', dto);

        expect(tasksService.update).toHaveBeenCalledWith('1', dto);
        expect(result).toEqual(mockTask);
    });

    // Verifies that the controller forwards delete requests with id.
    it('remove() delegates to TasksService.remove with the id', async () => {
        const result = await controller.remove('1');

        expect(tasksService.remove).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockTask);
    });
});