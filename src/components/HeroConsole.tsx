import React, { useEffect, useRef } from 'react';

export function HeroConsole() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 520;
    const height = 280;
    canvas.width = width;
    canvas.height = height;
    let running = true;
    let visible = true;
    let raf = 0;
    let last = 0;
    let paddleX = 205;
    let ball = { x: 260, y: 190, dx: 3.6, dy: -3.2 };
    let bricks = Array.from({ length: 32 }, (_, i) => ({
      x: 22 + (i % 8) * 61,
      y: 34 + Math.floor(i / 8) * 28,
      on: true,
    }));

    const reset = () => {
      bricks = bricks.map((brick) => ({ ...brick, on: true }));
      ball = { x: 260, y: 190, dx: Math.random() > 0.5 ? 3.6 : -3.6, dy: -3.2 };
    };

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);
      if (!running || !visible || document.hidden || time - last < 34) return;
      last = time;
      ctx.fillStyle = '#20263e';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#2b3655';
      for (let x = 0; x < width; x += 20) ctx.fillRect(x, 0, 1, height);
      for (let y = 0; y < height; y += 20) ctx.fillRect(0, y, width, 1);
      const colors = ['#9edce8', '#c4a0e7', '#e8a6d5', '#9edce8'];
      bricks.forEach((brick, i) => {
        if (!brick.on) return;
        ctx.fillStyle = colors[Math.floor(i / 8)];
        ctx.fillRect(brick.x, brick.y, 52, 18);
      });

      paddleX += (ball.x - (paddleX + 55)) * 0.08;
      paddleX = Math.max(8, Math.min(width - 118, paddleX));
      ctx.fillStyle = '#9edce8';
      ctx.fillRect(paddleX, 252, 110, 12);
      ctx.fillStyle = '#f1b0dc';
      ctx.fillRect(ball.x - 6, ball.y - 6, 12, 12);

      ball.x += ball.dx;
      ball.y += ball.dy;
      if (ball.x < 7 || ball.x > width - 7) ball.dx *= -1;
      if (ball.y < 7) ball.dy = Math.abs(ball.dy);
      if (ball.y > 244 && ball.y < 266 && ball.x > paddleX && ball.x < paddleX + 110) ball.dy = -Math.abs(ball.dy);
      if (ball.y > height + 10) reset();

      for (const brick of bricks) {
        if (brick.on && ball.x > brick.x && ball.x < brick.x + 52 && ball.y > brick.y && ball.y < brick.y + 18) {
          brick.on = false;
          ball.dy *= -1;
          break;
        }
      }
      if (bricks.every((brick) => !brick.on)) reset();
    };

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.1 });
    observer.observe(shell);
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={shellRef} className="hero-console" data-parallax>
      <div className="hero-console__shadow" />
      <div className="hero-console__body">
        <div className="hero-console__label"><span>NEU-BOY</span><span>POWER ●</span></div>
        <div className="hero-console__screen">
          <div className="hero-console__hud"><span>AUTO BREAKOUT</span><span>● ● ●</span></div>
          <canvas ref={canvasRef} aria-label="自動で動くブロック崩しのデモ" />
          <p>BREAK THINGS. FIND IDEAS.</p>
        </div>
        <div className="hero-console__controls">
          <div className="dpad"><i /><i /></div>
          <div className="console-center">
            <div className="console-speaker" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="console-note">SELECT&nbsp;&nbsp;START</div>
          </div>
          <div className="ab"><b>B</b><b>A</b></div>
        </div>
      </div>
      <span className="console-tape" aria-hidden="true" />
    </div>
  );
}
