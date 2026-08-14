import { buildDummyDrifts } from './Chat';

describe('buildDummyDrifts', () => {
  it('puts the logged-in user first and keeps the list horizontally scrollable-friendly', () => {
    const user = { id: 42, username: 'maria', avatar_url: null };

    const drifts = buildDummyDrifts(user);

    expect(drifts[0].user_id).toBe(42);
    expect(drifts[0].username).toBe('maria');
    expect(drifts.some((drift) => drift.username === 'alex_')).toBe(true);
    expect(drifts.length).toBeGreaterThan(0);
  });
});
