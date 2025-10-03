import PlayerService from '../src/playerService';

describe('DbClient', () => {
  test('devrait créer une instance', () => {
    expect(PlayerService.getInstance()).toBeInstanceOf(PlayerService);
  });

  test('devrait retourner la même instance', () => {
    const instance1 = PlayerService.getInstance();
    const instance2 = PlayerService.getInstance();
    expect(instance1).toBe(instance2);
  });
});
