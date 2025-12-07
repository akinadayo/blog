import React, { useEffect, useRef } from 'react';

export function RetroGameBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    // 表示領域に合わせてサイズ設定
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      return { width: rect.width, height: rect.height };
    };

    let { width: canvasWidth, height: canvasHeight } = updateSize();

    // ゲーム設定（キャンバスサイズに応じて調整）
    const getConfig = () => {
      const baseScale = Math.min(canvasWidth / 800, canvasHeight / 500);
      const isMobile = canvasWidth < 768;
      const rows = isMobile ? 6 : 5;
      const cols = isMobile ? 5 : 10;

      // ブロックエリアの高さを全体の40%に設定
      const brickAreaHeight = canvasHeight * 0.4;
      const brickPadding = 6 * baseScale;
      const brickHeight = (brickAreaHeight - brickPadding * (rows + 1)) / rows;

      return {
        PADDLE_WIDTH: Math.max(80, canvasWidth * 0.1),
        PADDLE_HEIGHT: Math.max(12, 15 * baseScale),
        BALL_RADIUS: Math.max(6, 8 * baseScale),
        BRICK_PADDING: brickPadding,
        BRICK_OFFSET_TOP: canvasHeight * 0.05, // 上から5%の位置から開始
        BRICK_ROWS: rows,
        BRICK_COLS: cols,
        BRICK_HEIGHT: brickHeight,
        PADDLE_OFFSET_BOTTOM: canvasHeight * 0.08, // 下から8%の位置
        BALL_SPEED: Math.max(3, 4 * baseScale),
        PADDLE_SPEED: Math.max(4, 6 * baseScale),
        scale: baseScale,
      };
    };

    let config = getConfig();

    const BRICK_WIDTH = () => (canvasWidth - config.BRICK_PADDING * (config.BRICK_COLS + 1)) / config.BRICK_COLS;
    const BRICK_HEIGHT = () => config.BRICK_HEIGHT;

    // ゲームオブジェクト（AIパドル）
    const paddle = {
      x: canvasWidth / 2 - config.PADDLE_WIDTH / 2,
      y: canvasHeight - config.PADDLE_OFFSET_BOTTOM,
      width: config.PADDLE_WIDTH,
      height: config.PADDLE_HEIGHT,
      speed: config.PADDLE_SPEED,
    };

    const ball = {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      radius: config.BALL_RADIUS,
      dx: config.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -config.BALL_SPEED,
    };

    // ブロック生成（最小限の配列操作）
    const brickColors = [
      'hsl(190, 70%, 75%)',
      'hsl(280, 60%, 75%)',
      'hsl(320, 70%, 80%)',
      'hsl(200, 80%, 70%)',
      'hsl(160, 60%, 75%)',
      'hsl(340, 70%, 80%)',
    ];

    const bricks: { x: number; y: number; status: number; color: string }[][] = [];

    const createBricks = () => {
      bricks.length = 0;
      const bw = BRICK_WIDTH();
      const bh = BRICK_HEIGHT();
      for (let row = 0; row < config.BRICK_ROWS; row++) {
        bricks[row] = [];
        const color = brickColors[row % brickColors.length];
        for (let col = 0; col < config.BRICK_COLS; col++) {
          bricks[row][col] = {
            x: col * (bw + config.BRICK_PADDING) + config.BRICK_PADDING,
            y: row * (bh + config.BRICK_PADDING) + config.BRICK_OFFSET_TOP,
            status: 1,
            color: color,
          };
        }
      }
    };

    createBricks();

    let animationId: number;
    let lastFrameTime = 0;
    const frameInterval = 33; // 30FPS

    // ゲームループ
    const gameLoop = (currentTime: number) => {
      // フレームレート制限
      if (currentTime - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(gameLoop);
        return;
      }
      lastFrameTime = currentTime;

      const bw = BRICK_WIDTH();
      const bh = BRICK_HEIGHT();

      // 背景
      ctx.fillStyle = 'hsl(230, 30%, 15%)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // ブロック描画
      for (let row = 0; row < config.BRICK_ROWS; row++) {
        for (let col = 0; col < config.BRICK_COLS; col++) {
          const brick = bricks[row]?.[col];
          if (brick && brick.status === 1) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, bw, bh);
            ctx.strokeStyle = 'hsl(200, 80%, 90%)';
            ctx.lineWidth = 2;
            ctx.strokeRect(brick.x, brick.y, bw, bh);
          }
        }
      }

      // ボール描画
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(180, 80%, 85%)';
      ctx.fill();
      ctx.strokeStyle = 'hsl(190, 90%, 70%)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // パドル描画
      ctx.fillStyle = 'hsl(170, 60%, 80%)';
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.strokeStyle = 'hsl(190, 70%, 75%)';
      ctx.lineWidth = 3;
      ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);

      // AI制御
      const ballCenter = ball.x;
      const paddleCenter = paddle.x + paddle.width / 2;
      if (ballCenter < paddleCenter - 10) {
        paddle.x -= paddle.speed;
      } else if (ballCenter > paddleCenter + 10) {
        paddle.x += paddle.speed;
      }
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > canvasWidth) paddle.x = canvasWidth - paddle.width;

      // ボール移動
      ball.x += ball.dx;
      ball.y += ball.dy;

      // 壁衝突
      if (ball.x + ball.radius > canvasWidth || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // パドル衝突
      if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width &&
        ball.dy > 0
      ) {
        const hitPos = (ball.x - paddle.x) / paddle.width;
        ball.dx = (hitPos - 0.5) * 10 * config.scale;
        ball.dy = -Math.abs(ball.dy);
      }

      // 下に落ちたらリセット
      if (ball.y + ball.radius > canvasHeight) {
        ball.x = canvasWidth / 2;
        ball.y = canvasHeight / 2;
        ball.dx = config.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = -config.BALL_SPEED;
      }

      // ブロック衝突
      for (let row = 0; row < config.BRICK_ROWS; row++) {
        for (let col = 0; col < config.BRICK_COLS; col++) {
          const brick = bricks[row]?.[col];
          if (brick && brick.status === 1) {
            if (
              ball.x > brick.x &&
              ball.x < brick.x + bw &&
              ball.y > brick.y &&
              ball.y < brick.y + bh
            ) {
              ball.dy = -ball.dy;
              brick.status = 0;

              // 全破壊でリセット
              let allDestroyed = true;
              for (let r = 0; r < config.BRICK_ROWS; r++) {
                for (let c = 0; c < config.BRICK_COLS; c++) {
                  if (bricks[r]?.[c]?.status === 1) {
                    allDestroyed = false;
                    break;
                  }
                }
                if (!allDestroyed) break;
              }
              if (allDestroyed) {
                createBricks();
              }
            }
          }
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    // 即座に開始
    animationId = requestAnimationFrame(gameLoop);

    // リサイズ対応
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      // デバウンス処理で頻繁なリサイズを抑制
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        const newSize = updateSize();
        canvasWidth = newSize.width;
        canvasHeight = newSize.height;
        const oldConfig = config;
        config = getConfig();

        // パドルとボールの位置を比率で調整
        paddle.x = (paddle.x / oldConfig.PADDLE_WIDTH) * config.PADDLE_WIDTH;
        paddle.y = canvasHeight - config.PADDLE_OFFSET_BOTTOM;
        paddle.width = config.PADDLE_WIDTH;
        paddle.height = config.PADDLE_HEIGHT;
        paddle.speed = config.PADDLE_SPEED;

        // ボールの位置を比率で維持
        ball.radius = config.BALL_RADIUS;

        // ブロックの位置を再計算（状態は維持）
        const bw = BRICK_WIDTH();
        const bh = BRICK_HEIGHT();
        for (let row = 0; row < bricks.length; row++) {
          for (let col = 0; col < (bricks[row]?.length || 0); col++) {
            if (bricks[row][col]) {
              bricks[row][col].x = col * (bw + config.BRICK_PADDING) + config.BRICK_PADDING;
              bricks[row][col].y = row * (bh + config.BRICK_PADDING) + config.BRICK_OFFSET_TOP;
            }
          }
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
