import assert from 'node:assert/strict';
import { createBreakoutAutoplay as createDemo } from '../src/lib/breakout-autoplay.js';
const demo = createDemo();
const start = structuredClone(demo.state);
demo.advance(0);
demo.advance(NaN);
demo.advance(Infinity);
demo.advance(-1);
assert.deepEqual(demo.state, start, 'invalid or zero time must not change the game');
for (let frame = 0; frame < 60 * 180; frame++) {
  demo.advance(1 / 60);
  const { ball, paddle, particles, bricks } = demo.state;
  assert.ok([ball.x, ball.y, ball.vx, ball.vy, paddle.x].every(Number.isFinite));
  assert.ok(ball.x >= 29 && ball.x <= 739, 'ball stays inside the side walls');
  assert.ok(ball.y >= 72, 'ball stays below the top wall');
  assert.ok(paddle.x >= 80 && paddle.x <= 688, 'paddle stays on the LCD');
  assert.equal(bricks.length, 24);
  assert.ok(particles.length < 100, 'hit effects stay bounded');
}
assert.ok(demo.state.totals.brickHits > 48, 'bricks must be destroyed in multiple rounds');
assert.ok(demo.state.totals.paddleHits > 20, 'the autopilot must return the ball');
assert.ok(demo.state.totals.wallHits > 20, 'wall reflections must happen');
assert.ok(demo.state.totals.clears >= 2, 'a cleared board must start another round');
assert.equal(demo.state.totals.misses, 0, 'the demo should keep playing without misses');
const halfRate = createDemo();
for (let frame = 0; frame < 30 * 180; frame++) halfRate.advance(1 / 30);
assert.equal(halfRate.state.totals.clears, demo.state.totals.clears, 'game speed is independent of display frame rate');
assert.equal(halfRate.state.totals.brickHits, demo.state.totals.brickHits);
console.log(JSON.stringify({ result: 'PASS', simulatedSeconds: 180, totals: demo.state.totals, round: demo.state.round }));
