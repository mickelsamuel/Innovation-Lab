import { Test, TestingModule } from '@nestjs/testing';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';

describe('TeamsController', () => {
  let controller: TeamsController;
  let service: TeamsService;

  const mockTeamsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findUserTeams: jest.fn(),
    update: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamsController],
      providers: [
        {
          provide: TeamsService,
          useValue: mockTeamsService,
        },
      ],
    }).compile();

    controller = module.get<TeamsController>(TeamsController);
    service = module.get<TeamsService>(TeamsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a team', async () => {
      const createDto = { hackathonId: 'h1', name: 'Team' } as any;
      const team = { id: 't1', ...createDto };
      mockTeamsService.create.mockResolvedValue(team);

      const user = { id: 'user-1' };
      const result = await controller.create(createDto, user as any);

      expect(result).toEqual(team);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return all teams for a hackathon', async () => {
      const teams = [{ id: 't1' }];
      mockTeamsService.findAll.mockResolvedValue(teams);

      const result = await controller.findAll('h1');

      expect(result).toEqual(teams);
      expect(service.findAll).toHaveBeenCalledWith('h1');
    });
  });

  describe('findOne', () => {
    it('should return a team by ID', async () => {
      const team = { id: 't1', name: 'Team' };
      mockTeamsService.findOne.mockResolvedValue(team);

      const result = await controller.findOne('t1');

      expect(result).toEqual(team);
      expect(service.findOne).toHaveBeenCalledWith('t1');
    });
  });

  describe('getMyTeams', () => {
    it('should return user teams', async () => {
      const teams = [{ id: 't1' }];
      mockTeamsService.findUserTeams.mockResolvedValue(teams);

      const user = { id: 'user-1' };
      const result = await controller.getMyTeams(user as any);

      expect(result).toEqual(teams);
      expect(service.findUserTeams).toHaveBeenCalledWith('user-1', undefined);
    });
  });

  describe('update', () => {
    it('should update a team', async () => {
      const updateDto = { name: 'Updated' };
      const updated = { id: 't1', ...updateDto };
      mockTeamsService.update.mockResolvedValue(updated);

      const user = { id: 'user-1' };
      const result = await controller.update('t1', updateDto, user as any);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('t1', updateDto, 'user-1');
    });
  });

  describe('addMember', () => {
    it('should add a member to team', async () => {
      const inviteDto = { userId: 'user-2', role: 'MEMBER' } as any;
      const team = { id: 't1', members: [] };
      mockTeamsService.addMember.mockResolvedValue(team);

      const user = { id: 'user-1' };
      const result = await controller.addMember('t1', inviteDto, user as any);

      expect(result).toEqual(team);
      expect(service.addMember).toHaveBeenCalledWith('t1', inviteDto, 'user-1');
    });
  });

  describe('removeMember', () => {
    it('should remove a member from team', async () => {
      const response = { success: true, message: 'Removed' };
      mockTeamsService.removeMember.mockResolvedValue(response);

      const user = { id: 'user-1' };
      const result = await controller.removeMember('t1', 'user-2', user as any);

      expect(result).toEqual(response);
      expect(service.removeMember).toHaveBeenCalledWith('t1', 'user-2', 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete a team', async () => {
      const response = { success: true, message: 'Deleted' };
      mockTeamsService.remove.mockResolvedValue(response);

      const user = { id: 'user-1' };
      const result = await controller.remove('t1', user as any);

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith('t1', 'user-1');
    });
  });
});
