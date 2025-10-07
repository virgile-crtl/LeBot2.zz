import PlayerService from '../src/playerService';

describe('DbClient', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Create instance', () => {
    expect(PlayerService.getInstance()).toBeInstanceOf(PlayerService);
  });

  test('Get singleton instance', () => {
    expect(PlayerService.getInstance()).toBe(PlayerService.getInstance());
  });
});
