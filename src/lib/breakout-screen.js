export function drawBreakoutScreen(ctx, state, playing, palette) {
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
      ctx.fillStyle = palette.screen;
      ctx.fillRect(0, 0, 768, 440);
      ctx.fillStyle = palette.ink;
      ctx.font = '500 28px monospace';
      ctx.fillText('BREAKOUT', 30, 45);
      ctx.font = '27px monospace';
      ctx.fillText(Array.from({ length: state.lives }, () => '♡').join(' '), 580, 45);
      ctx.save();
      ctx.beginPath();
      ctx.rect(15, 62, 738, 335);
      ctx.clip();
      for (const brick of state.bricks) {
        if (!brick.alive) continue;
        ctx.fillStyle = palette.bricks[brick.row];
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      }
      for (const particle of state.particles) {
        ctx.fillStyle = palette.bricks[particle.row];
        ctx.globalAlpha = Math.max(0, particle.life / .26);
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
      }
      ctx.fillStyle = palette.ink;
      state.trail.forEach((point, index) => {
        ctx.globalAlpha = .035 + index * .027;
        ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
      });
      ctx.globalAlpha = 1;
      ctx.fillRect(state.ball.x - state.ball.r, state.ball.y - state.ball.r, state.ball.r * 2, state.ball.r * 2);
      ctx.fillRect(state.paddle.x - state.paddle.width / 2, state.paddle.y, state.paddle.width, state.paddle.height);
      ctx.restore();
      ctx.font = '22px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = palette.ink;
      ctx.fillText(!playing ? 'PAUSED' : state.phase === 'clear' ? 'STAGE CLEAR!' : 'AUTO PLAY', 384, 421);
      ctx.textAlign = 'left';
    }
