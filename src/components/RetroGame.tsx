import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { communityApi, type CommunityScore } from '../lib/community';

interface RetroGameProps {
  onClose: () => void;
}

type GameState = 'ready' | 'playing' | 'paused' | 'gameover' | 'win';

const RUN_NAME = 'スコアアタック';

const NAME_ADJECTIVES = ['ぴか', 'きら', 'もふ', 'ぷに', 'ふわ', 'どき', 'わく', 'ねむ', 'ちび', 'るん', 'ぽよ', 'めが'];
const NAME_NOUNS = ['うさぎ', 'こねこ', 'スライム', 'ドラゴン', 'パドル', 'ほうせき', 'スター', 'まおう', 'けんし', 'きつね', 'ブロック', 'まほう'];
const NAME_SUFFIXES = ['', '', '', '★', '♪', 'DX', '3', 'Z', 'さん', 'まる', 'JP'];

const generatePlayerName = () => {
  const pick = (words: string[]) => words[Math.floor(Math.random() * words.length)];
  return `${pick(NAME_ADJECTIVES)}${pick(NAME_NOUNS)}${pick(NAME_SUFFIXES)}`.slice(0, 12);
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: 'wide' | 'multi' | 'slow' | 'life';
  vy: number;
}

export function RetroGame({ onClose }: RetroGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('brickBreaker_highScore') || '0');
    }
    return 0;
  });
  const highScoreRef = useRef(highScore);
  const [gameState, setGameState] = useState<GameState>('ready');
  const [combo, setCombo] = useState(0);
  const [runBonus, setRunBonus] = useState(0);
  const gameLoopRef = useRef<number>();
  const gameStateRef = useRef<GameState>('ready');
  const touchStartRef = useRef<number | null>(null);
  const needsRunResetRef = useRef(false);
  const needsFullResetRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [playerName, setPlayerName] = useState(() => typeof window === 'undefined' ? 'NEU' : localStorage.getItem('neulog-player-name') || 'NEU');
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [ranking, setRanking] = useState<CommunityScore[]>([]);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // ゲームの状態を同期
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ハイスコア保存
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    if (score > highScoreRef.current) {
      setHighScore(score);
      highScoreRef.current = score;
      if (typeof window !== 'undefined') {
        localStorage.setItem('brickBreaker_highScore', score.toString());
        window.dispatchEvent(new CustomEvent('neulog-personal-best', { detail: score }));
      }
    }
  }, [score]);

  // クリア後は名前入力を主操作として自動フォーカス
  useEffect(() => {
    if (gameState !== 'win') return;
    const focusTimer = window.setTimeout(() => {
      const input = nameInputRef.current;
      if (!input) return;
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
      input.select();
    }, 300);
    return () => window.clearTimeout(focusTimer);
  }, [gameState]);

  const startGameRef = useRef(() => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    setCombo(0);
    setRunBonus(0);
    needsRunResetRef.current = true;
    needsFullResetRef.current = true;
    sessionIdRef.current = null;
    setSessionReady(false);
    setSubmitState('idle');
    setRanking([]);
    communityApi<{ sessionId: string }>('start-game', { method: 'POST' })
      .then(data => { sessionIdRef.current = data.sessionId; setSessionReady(true); })
      .catch(() => { sessionIdRef.current = null; setSessionReady(false); });
  });

  const startGame = startGameRef.current;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズ設定（レスポンシブ）
    const updateCanvasSize = () => {
      const maxWidth = Math.min(container.clientWidth - 32, 800);
      const aspectRatio = 4 / 3;
      const width = maxWidth;
      const height = width / aspectRatio;

      canvas.width = width;
      canvas.height = height;

      return { width, height };
    };

    let { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = updateCanvasSize();

    // ゲーム設定（相対サイズ）
    const getGameConfig = () => {
      const scale = CANVAS_WIDTH / 800;
      const cols = 9;
      return {
        PADDLE_WIDTH: 118 * scale,
        PADDLE_HEIGHT: 16 * scale,
        BALL_RADIUS: 10 * scale,
        BRICK_ROWS: 5,
        BRICK_COLS: cols,
        BRICK_WIDTH: (CANVAS_WIDTH - 40 * scale) / cols - 8 * scale,
        BRICK_HEIGHT: 24 * scale,
        BRICK_PADDING: 8 * scale,
        BRICK_OFFSET_TOP: 86 * scale,
        BRICK_OFFSET_LEFT: 20 * scale,
        BALL_SPEED: 3.65 * scale,
        scale,
      };
    };

    let config = getGameConfig();

    // ゲームオブジェクト
    let paddle = {
      x: CANVAS_WIDTH / 2 - config.PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 50 * config.scale,
      width: config.PADDLE_WIDTH,
      height: config.PADDLE_HEIGHT,
      targetX: CANVAS_WIDTH / 2 - config.PADDLE_WIDTH / 2,
    };

    let balls: {
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
      trail: { x: number; y: number }[];
    }[] = [];

    // ボール待機状態（パドルに乗っている）
    let ballWaiting = true;

    const resetBall = (waiting: boolean = true) => {
      ballWaiting = waiting;
      balls = [{
        x: paddle.x + paddle.width / 2,
        y: paddle.y - config.BALL_RADIUS - 2,
        radius: config.BALL_RADIUS,
        dx: 0,
        dy: 0,
        trail: [],
      }];
    };

    // ボール発射
    const launchBall = () => {
      if (ballWaiting && balls.length > 0) {
        ballWaiting = false;
        balls[0].dx = config.BALL_SPEED * 0.72;
        balls[0].dy = -config.BALL_SPEED;
      }
    };

    resetBall(true);

    // ブロック生成
    type Brick = {
      x: number;
      y: number;
      status: number;
      color: string;
      hitPoints: number;
      maxHitPoints: number;
      hasPowerUp: boolean;
      powerUpType?: PowerUp['type'];
      kind: 'normal' | 'armor' | 'bonus';
    };

    let bricks: Brick[][] = [];
    let runBrickTotal = 0;
    let runResolved = false;

    const createBricks = () => {
      // ブログテーマカラー
      const colors = [
        ['hsl(320, 70%, 80%)', 'hsl(320, 70%, 65%)'], // accent (ピンク)
        ['hsl(280, 60%, 75%)', 'hsl(280, 60%, 60%)'], // secondary (パープル)
        ['hsl(190, 70%, 75%)', 'hsl(190, 70%, 60%)'], // primary (シアン)
        ['hsl(320, 70%, 70%)', 'hsl(320, 70%, 55%)'], // accent dark
        ['hsl(280, 60%, 65%)', 'hsl(280, 60%, 50%)'], // secondary dark
        ['hsl(190, 70%, 65%)', 'hsl(190, 70%, 50%)'], // primary dark
        ['hsl(0, 70%, 70%)', 'hsl(0, 70%, 55%)'],     // destructive (赤)
        ['hsl(200, 50%, 70%)', 'hsl(200, 50%, 55%)'], // muted
      ];

      bricks = [];
      runBrickTotal = 0;
      runResolved = false;
      const layoutSeed = 1;
      const powerUpTypes: PowerUp['type'][] = ['wide', 'multi', 'slow', 'life'];
      for (let row = 0; row < config.BRICK_ROWS; row++) {
        bricks[row] = [];
        for (let col = 0; col < config.BRICK_COLS; col++) {
          const isGap =
            (row === 0 && (col < 2 || col > 6)) ||
            (row === 2 && col % 2 === 1);
          const isBonus = !isGap && (row * 3 + col + layoutSeed) % 11 === 0;
          const isArmor = !isGap && !isBonus && (row === 0 || (row === 1 && col % 3 === 1));
          const kind: Brick['kind'] = isBonus ? 'bonus' : isArmor ? 'armor' : 'normal';
          const hitPoints = isArmor ? 2 : 1;
          const colorIndex = row % colors.length;
          const powerIndex = row * 7 + col * 3 + layoutSeed;
          const hasPowerUp = !isGap && !isBonus && powerIndex % 13 === 0;
          if (!isGap) runBrickTotal++;
          bricks[row][col] = {
            x: col * (config.BRICK_WIDTH + config.BRICK_PADDING) + config.BRICK_OFFSET_LEFT,
            y: row * (config.BRICK_HEIGHT + config.BRICK_PADDING) + config.BRICK_OFFSET_TOP,
            status: isGap ? 0 : 1,
            color: isBonus ? 'hsl(190, 78%, 88%)' : colors[colorIndex][0],
            hitPoints,
            maxHitPoints: hitPoints,
            hasPowerUp,
            powerUpType: hasPowerUp ? powerUpTypes[powerIndex % powerUpTypes.length] : undefined,
            kind,
          };
        }
      }
    };

    createBricks();

    // パーティクル
    let particles: Particle[] = [];

    const createParticles = (x: number, y: number, color: string, count: number = 12) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed * config.scale,
          vy: Math.sin(angle) * speed * config.scale,
          life: 1,
          color,
          size: (3 + Math.random() * 4) * config.scale,
        });
      }
    };

    // パワーアップ
    let powerUps: PowerUp[] = [];
    let powerUpEffects = {
      wide: 0,
      slow: 0,
    };

    const createPowerUp = (x: number, y: number, type: PowerUp['type']) => {
      powerUps.push({
        x,
        y,
        type,
        vy: 3 * config.scale,
      });
    };

    // スコア・コンボ
    let currentScore = 0;
    let currentCombo = 0;
    let comboTimer = 0;
    let currentLives = 3;
    let shakeIntensity = 0;
    let precisionArmed = false;
    let precisionFlash = 0;
    let runFrames = 0;

    // 入力処理
    const keys: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd') {
        keys.right = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a') {
        keys.left = true;
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (gameStateRef.current === 'ready') {
          startGame();
        } else if (gameStateRef.current === 'playing' && ballWaiting) {
          launchBall();
        }
      } else if (e.key === 'Escape') {
        if (gameStateRef.current === 'playing') {
          setGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          setGameState('playing');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'd') {
        keys.right = false;
      } else if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'a') {
        keys.left = false;
      }
    };

    // マウス・タッチ操作
    const handlePointerMove = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const canvasX = (relativeX / rect.width) * CANVAS_WIDTH;
      paddle.targetX = Math.max(0, Math.min(CANVAS_WIDTH - paddle.width, canvasX - paddle.width / 2));
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handlePointerMove(e.touches[0].clientX);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        touchStartRef.current = e.touches[0].clientX;
        handlePointerMove(e.touches[0].clientX);
      }
      if (gameStateRef.current === 'ready') {
        startGame();
      } else if (gameStateRef.current === 'playing' && ballWaiting) {
        launchBall();
      }
    };

    const handleClick = () => {
      if (gameStateRef.current === 'ready') {
        startGame();
      } else if (gameStateRef.current === 'playing' && ballWaiting) {
        launchBall();
      }
    };

    // イベントリスナー設定
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('click', handleClick);

    // 描画関数
    const drawBackground = () => {
      // グラデーション背景
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      // ブログ背景色 hsl(230, 30%, 15%)
      gradient.addColorStop(0, 'hsl(230, 30%, 12%)');
      gradient.addColorStop(1, 'hsl(230, 30%, 18%)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // グリッド (primary色)
      ctx.strokeStyle = 'hsla(190, 70%, 75%, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 40 * config.scale;
      for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
    };

    const drawBall = (ball: typeof balls[0]) => {
      // トレイル
      ball.trail.forEach((pos, i) => {
        const alpha = (i / ball.trail.length) * 0.5;
        const size = ball.radius * (0.3 + (i / ball.trail.length) * 0.7);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(320, 70%, 80%, ${alpha})`;
        ctx.fill();
      });

      // メインボール
      const gradient = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3,
        ball.y - ball.radius * 0.3,
        0,
        ball.x,
        ball.y,
        ball.radius
      );
      // accent色（ピンク）
      gradient.addColorStop(0, 'hsl(320, 70%, 90%)');
      gradient.addColorStop(0.5, 'hsl(320, 70%, 80%)');
      gradient.addColorStop(1, 'hsl(320, 70%, 65%)');

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // グロー (accent)
      ctx.shadowColor = 'hsl(320, 70%, 80%)';
      ctx.shadowBlur = 15 * config.scale;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'transparent';
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawPaddle = () => {
      const paddleGradient = ctx.createLinearGradient(
        paddle.x,
        paddle.y,
        paddle.x,
        paddle.y + paddle.height
      );
      // primary色（シアン）
      paddleGradient.addColorStop(0, 'hsl(190, 70%, 85%)');
      paddleGradient.addColorStop(0.5, 'hsl(190, 70%, 75%)');
      paddleGradient.addColorStop(1, 'hsl(190, 70%, 60%)');

      // パドル本体
      ctx.fillStyle = paddleGradient;
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8 * config.scale);
      ctx.fill();

      // ハイライト
      ctx.fillStyle = 'hsla(180, 100%, 90%, 0.5)';
      ctx.beginPath();
      ctx.roundRect(
        paddle.x + 4 * config.scale,
        paddle.y + 2 * config.scale,
        paddle.width - 8 * config.scale,
        4 * config.scale,
        2 * config.scale
      );
      ctx.fill();

      // グロー (primary)
      ctx.shadowColor = 'hsl(190, 70%, 75%)';
      ctx.shadowBlur = 20 * config.scale;
      ctx.fillStyle = 'transparent';
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8 * config.scale);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawBrick = (brick: Brick) => {
      if (brick.status !== 1) return;

      const healthRatio = brick.hitPoints / brick.maxHitPoints;
      const baseColor = brick.color;

      // ブロック本体
      const gradient = ctx.createLinearGradient(
        brick.x,
        brick.y,
        brick.x,
        brick.y + config.BRICK_HEIGHT
      );
      // hsl(H, S%, L%) から暗い色を計算
      const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      const darkerColor = hslMatch
        ? `hsl(${hslMatch[1]}, ${hslMatch[2]}%, ${Math.max(0, parseInt(hslMatch[3]) - 15)}%)`
        : baseColor;
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, darkerColor);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, config.BRICK_WIDTH, config.BRICK_HEIGHT, 4 * config.scale);
      ctx.fill();

      // ハイライト
      ctx.fillStyle = 'hsla(0, 0%, 100%, 0.3)';
      ctx.beginPath();
      ctx.roundRect(
        brick.x + 3 * config.scale,
        brick.y + 2 * config.scale,
        config.BRICK_WIDTH - 6 * config.scale,
        6 * config.scale,
        2 * config.scale
      );
      ctx.fill();

      if (brick.kind === 'armor') {
        ctx.strokeStyle = 'hsl(190, 78%, 90%)';
        ctx.lineWidth = 2 * config.scale;
        ctx.strokeRect(
          brick.x + 4 * config.scale,
          brick.y + 4 * config.scale,
          config.BRICK_WIDTH - 8 * config.scale,
          config.BRICK_HEIGHT - 8 * config.scale
        );
      } else if (brick.kind === 'bonus') {
        ctx.fillStyle = 'hsl(236, 40%, 16%)';
        ctx.beginPath();
        ctx.moveTo(brick.x + config.BRICK_WIDTH / 2, brick.y + 5 * config.scale);
        ctx.lineTo(brick.x + config.BRICK_WIDTH / 2 + 6 * config.scale, brick.y + config.BRICK_HEIGHT / 2);
        ctx.lineTo(brick.x + config.BRICK_WIDTH / 2, brick.y + config.BRICK_HEIGHT - 5 * config.scale);
        ctx.lineTo(brick.x + config.BRICK_WIDTH / 2 - 6 * config.scale, brick.y + config.BRICK_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
      }

      // ダメージ表示
      if (healthRatio < 1) {
        ctx.strokeStyle = 'hsla(0, 0%, 0%, 0.5)';
        ctx.lineWidth = 2 * config.scale;
        const cracks = Math.ceil((1 - healthRatio) * 3);
        for (let i = 0; i < cracks; i++) {
          ctx.beginPath();
          const startX = brick.x + config.BRICK_WIDTH * (0.2 + Math.random() * 0.6);
          const startY = brick.y + config.BRICK_HEIGHT * 0.3;
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + (Math.random() - 0.5) * 20 * config.scale, brick.y + config.BRICK_HEIGHT * 0.7);
          ctx.stroke();
        }
      }

      // パワーアップ持ちマーク (accent)
      if (brick.hasPowerUp) {
        ctx.fillStyle = 'hsla(320, 70%, 80%, 0.9)';
        ctx.beginPath();
        ctx.arc(
          brick.x + config.BRICK_WIDTH / 2,
          brick.y + config.BRICK_HEIGHT / 2,
          4 * config.scale,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    };

    const drawBricks = () => {
      for (let row = 0; row < bricks.length; row++) {
        for (let col = 0; col < bricks[row].length; col++) {
          drawBrick(bricks[row][col]);
        }
      }
    };

    const drawParticles = () => {
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawPowerUps = () => {
      powerUps.forEach(pu => {
        let color = '';
        let icon = '';
        switch (pu.type) {
          case 'wide': color = 'hsl(190, 70%, 75%)'; icon = '⬌'; break;   // primary
          case 'multi': color = 'hsl(320, 70%, 80%)'; icon = '×3'; break; // accent
          case 'slow': color = 'hsl(280, 60%, 75%)'; icon = '▼'; break;   // secondary
          case 'life': color = 'hsl(320, 70%, 80%)'; icon = '♥'; break;
        }

        // グロー
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * config.scale;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 15 * config.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${12 * config.scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, pu.x, pu.y);
      });
    };

    const drawUI = () => {
      const fontSize = Math.max(14, 16 * config.scale);
      ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;

      // スコア (accent)
      ctx.fillStyle = 'hsl(320, 70%, 80%)';
      ctx.textAlign = 'left';
      ctx.fillText(`スコア ${currentScore}`, 15 * config.scale, 30 * config.scale);

      // ハイスコア (secondary)
      ctx.fillStyle = 'hsl(280, 60%, 75%)';
      ctx.textAlign = 'center';
      ctx.fillText(`HI: ${Math.max(currentScore, highScoreRef.current)}`, CANVAS_WIDTH / 2, 30 * config.scale);

      // レベル (primary)
      ctx.fillStyle = 'hsl(190, 70%, 75%)';
      ctx.textAlign = 'right';
      ctx.fillText('ONE RUN', CANVAS_WIDTH - 15 * config.scale, 30 * config.scale);

      // ライフ (destructive)
      ctx.textAlign = 'left';
      ctx.fillStyle = 'hsl(320, 70%, 80%)';
      let lifeText = '';
      for (let i = 0; i < currentLives; i++) {
        lifeText += '♥ ';
      }
      ctx.fillText(lifeText, 15 * config.scale, 55 * config.scale);

      const remaining = bricks.flat().filter(brick => brick.status === 1).length;
      ctx.fillStyle = 'hsl(190, 70%, 82%)';
      ctx.textAlign = 'right';
      ctx.font = `bold ${Math.max(10, 12 * config.scale)}px "Press Start 2P", monospace`;
      ctx.fillText(`残り ${remaining}/${runBrickTotal}`, CANVAS_WIDTH - 15 * config.scale, 55 * config.scale);

      if (precisionArmed || precisionFlash > 0) {
        ctx.fillStyle = precisionArmed ? 'hsl(320, 70%, 84%)' : 'hsla(320, 70%, 84%, .55)';
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.max(11, 13 * config.scale)}px "Press Start 2P", monospace`;
        ctx.fillText(precisionArmed ? 'EDGE ×2 READY' : 'EDGE SHOT!', CANVAS_WIDTH / 2, 57 * config.scale);
      }

      // コンボ (accent)
      if (currentCombo > 1) {
        const chainMultiplier = 1 + Math.min(3, Math.floor((currentCombo - 1) / 4));
        ctx.fillStyle = `hsla(320, 70%, 80%, ${Math.min(1, comboTimer / 30)})`;
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.max(20, 24 * config.scale)}px "Press Start 2P", monospace`;
        ctx.fillText(`${currentCombo} CHAIN  ×${chainMultiplier}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }

      // 待機中メッセージ
      if (ballWaiting && gameStateRef.current === 'playing') {
        const isMobile = 'ontouchstart' in window;
        ctx.fillStyle = 'hsl(190, 70%, 85%)';
        ctx.textAlign = 'center';
        ctx.font = `bold ${Math.max(10, 12 * config.scale)}px "Press Start 2P", monospace`;
        ctx.fillText(
          isMobile ? 'タップで発射' : 'クリック / SPACEで発射',
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT - 20 * config.scale
        );
      }
    };

    const drawReadyScreen = () => {
      ctx.fillStyle = 'hsla(0, 0%, 0%, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = 'hsl(320, 70%, 80%)'; // accent
      ctx.font = `bold ${Math.max(24, 32 * config.scale)}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('BRICK BREAKER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60 * config.scale);

      ctx.fillStyle = 'hsl(190, 70%, 75%)'; // primary
      ctx.font = `bold ${Math.max(14, 16 * config.scale)}px "Press Start 2P", monospace`;
      ctx.fillText(`1面完結 / ${RUN_NAME}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20 * config.scale);

      ctx.fillStyle = 'hsl(280, 60%, 75%)'; // secondary
      ctx.font = `bold ${Math.max(12, 14 * config.scale)}px "Press Start 2P", monospace`;

      const isMobile = 'ontouchstart' in window;
      if (isMobile) {
        ctx.fillText('タップして開始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30 * config.scale);
        ctx.fillStyle = 'hsl(190, 70%, 85%)'; // foreground
        ctx.font = `${Math.max(10, 12 * config.scale)}px sans-serif`;
        ctx.fillText('端で返すと、次の破壊スコアが2倍', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60 * config.scale);
      } else {
        ctx.fillText('クリック / SPACEで開始', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30 * config.scale);
        ctx.fillStyle = 'hsl(190, 70%, 85%)'; // foreground
        ctx.font = `${Math.max(10, 12 * config.scale)}px sans-serif`;
        ctx.fillText('端で返すと、次の破壊スコアが2倍', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60 * config.scale);
      }
    };

    const drawPausedScreen = () => {
      ctx.fillStyle = 'hsla(0, 0%, 0%, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = 'hsl(320, 70%, 80%)'; // accent
      ctx.font = `bold ${Math.max(24, 32 * config.scale)}px "Press Start 2P", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('一時停止', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

      ctx.fillStyle = 'hsl(190, 70%, 75%)'; // primary
      ctx.font = `bold ${Math.max(12, 14 * config.scale)}px "Press Start 2P", monospace`;
      ctx.fillText('ESCで再開', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40 * config.scale);
    };

    // 衝突検出
    const checkBrickCollision = () => {
      balls.forEach(ball => {
        for (let row = 0; row < bricks.length; row++) {
          for (let col = 0; col < bricks[row].length; col++) {
            const brick = bricks[row][col];
            if (brick.status !== 1) continue;

            if (
              ball.x + ball.radius > brick.x &&
              ball.x - ball.radius < brick.x + config.BRICK_WIDTH &&
              ball.y + ball.radius > brick.y &&
              ball.y - ball.radius < brick.y + config.BRICK_HEIGHT
            ) {
              // 衝突方向を判定
              const overlapLeft = ball.x + ball.radius - brick.x;
              const overlapRight = brick.x + config.BRICK_WIDTH - (ball.x - ball.radius);
              const overlapTop = ball.y + ball.radius - brick.y;
              const overlapBottom = brick.y + config.BRICK_HEIGHT - (ball.y - ball.radius);

              const minOverlapX = Math.min(overlapLeft, overlapRight);
              const minOverlapY = Math.min(overlapTop, overlapBottom);

              if (minOverlapX < minOverlapY) {
                ball.dx = -ball.dx;
              } else {
                ball.dy = -ball.dy;
              }

              brick.hitPoints--;

              if (brick.hitPoints <= 0) {
                brick.status = 0;

                // パーティクル
                createParticles(
                  brick.x + config.BRICK_WIDTH / 2,
                  brick.y + config.BRICK_HEIGHT / 2,
                  brick.color,
                  15
                );

                // パワーアップ
                if (brick.hasPowerUp) {
                  createPowerUp(
                    brick.x + config.BRICK_WIDTH / 2,
                    brick.y + config.BRICK_HEIGHT / 2,
                    brick.powerUpType || 'wide'
                  );
                }

                // 狙い方が得点差になるスコア計算
                currentCombo++;
                comboTimer = 180;
                const chainMultiplier = 1 + Math.min(3, Math.floor((currentCombo - 1) / 4));
                const precisionMultiplier = precisionArmed ? 2 : 1;
                const brickValue = brick.kind === 'bonus' ? 90 : brick.kind === 'armor' ? 35 : 20;
                const points = brickValue * chainMultiplier * precisionMultiplier;
                currentScore += points;
                setScore(currentScore);
                setCombo(currentCombo);
                if (precisionArmed) {
                  precisionArmed = false;
                  precisionFlash = 75;
                }

                // 画面シェイク
                shakeIntensity = 5;
              } else {
                // ヒットエフェクト
                createParticles(
                  ball.x,
                  ball.y,
                  brick.color,
                  5
                );
                shakeIntensity = 2;
              }

              // 全ブロック破壊チェック
              const remaining = bricks.flat().filter(b => b.status === 1).length;
              if (remaining === 0 && !runResolved) {
                runResolved = true;
                const elapsedSeconds = Math.floor(runFrames / 60);
                const speedBonus = Math.max(0, 1200 - elapsedSeconds * 12);
                const lifeBonus = currentLives * 180;
                const clearBonus = speedBonus + lifeBonus;
                setRunBonus(clearBonus);
                currentScore += clearBonus;
                setScore(currentScore);
                setGameState('win');
              }

              return;
            }
          }
        }
      });
    };

    // ゲームループ
    const gameLoop = () => {
      // レベル変更検知
      if (needsRunResetRef.current) {
        needsRunResetRef.current = false;
        if (needsFullResetRef.current) {
          needsFullResetRef.current = false;
          currentScore = 0;
          currentLives = 3;
          setScore(0);
          setLives(3);
        }
        config = getGameConfig();
        createBricks();
        resetBall(true);
        powerUps.length = 0;
        particles.length = 0;
        powerUpEffects.wide = 0;
        powerUpEffects.slow = 0;
        currentCombo = 0;
        comboTimer = 0;
        precisionArmed = false;
        precisionFlash = 0;
        runFrames = 0;
        setCombo(0);
      }

      // 画面シェイク
      if (shakeIntensity > 0) {
        ctx.save();
        ctx.translate(
          (Math.random() - 0.5) * shakeIntensity,
          (Math.random() - 0.5) * shakeIntensity
        );
        shakeIntensity *= 0.9;
        if (shakeIntensity < 0.5) shakeIntensity = 0;
      }

      drawBackground();
      drawBricks();
      drawParticles();
      drawPowerUps();

      if (gameStateRef.current === 'playing') {
        if (!ballWaiting) runFrames++;
        if (precisionFlash > 0) precisionFlash--;

        // パドル移動（スムーズ補間）
        const paddleSpeed = 0.15;
        paddle.x += (paddle.targetX - paddle.x) * paddleSpeed;

        // キーボード入力
        if (keys.right) {
          paddle.targetX = Math.min(CANVAS_WIDTH - paddle.width, paddle.targetX + 12 * config.scale);
        }
        if (keys.left) {
          paddle.targetX = Math.max(0, paddle.targetX - 12 * config.scale);
        }

        // パワーアップ効果適用
        if (powerUpEffects.wide > 0) {
          paddle.width = config.PADDLE_WIDTH * 1.5;
          powerUpEffects.wide--;
        } else {
          paddle.width = config.PADDLE_WIDTH;
        }

        const speedMultiplier = powerUpEffects.slow > 0 ? 0.6 : 1;
        if (powerUpEffects.slow > 0) powerUpEffects.slow--;

        // ボール更新
        balls.forEach((ball, ballIndex) => {
          // 待機中はパドルに追従
          if (ballWaiting && ballIndex === 0) {
            ball.x = paddle.x + paddle.width / 2;
            ball.y = paddle.y - ball.radius - 2;
            return; // 待機中は移動しない
          }

          // トレイル更新
          ball.trail.push({ x: ball.x, y: ball.y });
          if (ball.trail.length > 8) ball.trail.shift();

          // 移動
          ball.x += ball.dx * speedMultiplier;
          ball.y += ball.dy * speedMultiplier;

          // 壁衝突
          if (ball.x + ball.radius > CANVAS_WIDTH) {
            ball.x = CANVAS_WIDTH - ball.radius;
            ball.dx = -Math.abs(ball.dx);
          }
          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.dx = Math.abs(ball.dx);
          }
          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.dy = Math.abs(ball.dy);
          }

          // パドル衝突
          if (
            ball.y + ball.radius > paddle.y &&
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width &&
            ball.dy > 0
          ) {
            const hitPos = (ball.x - paddle.x) / paddle.width;
            const angle = (hitPos - 0.5) * Math.PI * 0.7;
            const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            ball.dx = Math.sin(angle) * speed;
            ball.dy = -Math.abs(Math.cos(angle) * speed);
            ball.y = paddle.y - ball.radius;

            if (hitPos <= 0.2 || hitPos >= 0.8) {
              precisionArmed = true;
              precisionFlash = 75;
              createParticles(ball.x, ball.y, 'hsl(320, 70%, 84%)', 12);
            }

            createParticles(ball.x, ball.y, 'hsl(190, 70%, 75%)', 5);
          }

          // 落下
          if (ball.y - ball.radius > CANVAS_HEIGHT) {
            balls.splice(ballIndex, 1);

            if (balls.length === 0) {
              currentLives--;
              setLives(currentLives);
              currentCombo = 0;
              setCombo(0);

              if (currentLives <= 0) {
                setGameState('gameover');
              } else {
                resetBall();
              }
            }
          }
        });

        // パワーアップ更新
        powerUps.forEach((pu, index) => {
          pu.y += pu.vy;

          // パドルとの衝突
          if (
            pu.y + 15 * config.scale > paddle.y &&
            pu.x > paddle.x &&
            pu.x < paddle.x + paddle.width
          ) {
            switch (pu.type) {
              case 'wide':
                powerUpEffects.wide = 600;
                break;
              case 'multi':
                if (balls.length < 4 && balls[0]) {
                  const source = balls[0];
                  const horizontalSpeed = Math.max(config.BALL_SPEED * 0.7, Math.abs(source.dx));
                  balls.push(
                    { ...source, dx: -horizontalSpeed, trail: [] },
                    { ...source, dx: horizontalSpeed, trail: [] },
                  );
                }
                break;
              case 'slow':
                powerUpEffects.slow = 300;
                break;
              case 'life':
                currentLives = Math.min(currentLives + 1, 5);
                setLives(currentLives);
                break;
            }
            powerUps.splice(index, 1);
            createParticles(pu.x, pu.y, 'hsl(320, 70%, 80%)', 10);
          }

          // 画面外
          if (pu.y > CANVAS_HEIGHT) {
            powerUps.splice(index, 1);
          }
        });

        // コンボタイマー
        if (comboTimer > 0) {
          comboTimer--;
          if (comboTimer === 0) {
            currentCombo = 0;
            setCombo(0);
          }
        }

        // ブロック衝突
        checkBrickCollision();

        // パーティクル更新
        particles = particles.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.1 * config.scale;
          p.life -= 0.02;
          return p.life > 0;
        });
      }

      // 描画
      balls.forEach(ball => drawBall(ball));
      drawPaddle();
      drawUI();

      // オーバーレイ画面
      if (gameStateRef.current === 'ready') {
        drawReadyScreen();
      } else if (gameStateRef.current === 'paused') {
        drawPausedScreen();
      }

      if (shakeIntensity > 0) {
        ctx.restore();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    // リサイズ対応
    const handleResize = () => {
      const newSize = updateCanvasSize();
      CANVAS_WIDTH = newSize.width;
      CANVAS_HEIGHT = newSize.height;
      config = getGameConfig();

      // パドル位置調整
      paddle.y = CANVAS_HEIGHT - 50 * config.scale;
      paddle.width = config.PADDLE_WIDTH;
    };

    window.addEventListener('resize', handleResize);
    gameLoop();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    setGameState('ready');
    setScore(0);
    setLives(3);
    setCombo(0);
    setRunBonus(0);
    needsRunResetRef.current = true;
    needsFullResetRef.current = true;
  };

  const submitScore = async () => {
    const name = playerName.trim().slice(0, 12) || 'PLAYER';
    const sessionId = sessionIdRef.current;
    if (!sessionId || submitState === 'sending' || submitState === 'done') return;
    setSubmitState('sending');
    try {
      const data = await communityApi<{ leaderboard: CommunityScore[] }>('submit-score', {
        method: 'POST',
        body: { sessionId, name, score },
      });
      localStorage.setItem('neulog-player-name', name);
      setPlayerName(name);
      setRanking(data.leaderboard);
      setSubmitState('done');
      window.dispatchEvent(new CustomEvent('neulog-score-updated', { detail: data.leaderboard }));
    } catch {
      setSubmitState('error');
    }
  };

  const rollPlayerName = () => {
    setPlayerName(generatePlayerName());
    window.requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
  };

  const scoreRegistration = (highlight: boolean) => <div className={highlight ? 'score-register score-register--win' : 'score-register'}>
    {highlight && <p className="score-register__callout" aria-live="polite">クリア達成！名前を決めてランキングへ</p>}
    <label htmlFor="neulog-player-name">ランキング表示名</label>
    <div><input id="neulog-player-name" ref={nameInputRef} value={playerName} maxLength={12} onChange={event => setPlayerName(event.target.value)} aria-label="ランキングに表示する名前" />
      <button type="button" className="score-register__dice" onClick={rollPlayerName} aria-label="サイコロでランダムなプレイヤー名を作る" title="サイコロでランダムなプレイヤー名を作る">🎲 おまかせ</button>
      <button type="button" onClick={submitScore} disabled={!sessionReady || submitState === 'sending' || submitState === 'done'}>{submitState === 'sending' ? '送信中…' : submitState === 'done' ? '登録しました' : 'スコアを登録'}</button></div>
    {submitState === 'error' && <small>登録できませんでした。スコアは端末には残っています。</small>}
    {!sessionReady && <small>ランキング通信は準備中です。ゲームはそのまま遊べます。</small>}
    {ranking.length > 0 && <ol>{ranking.slice(0, 5).map((entry, index) => <li key={`${entry.player_name}-${index}`}><span>{index + 1}. {entry.player_name}</span><b>{entry.score.toLocaleString()}</b></li>)}</ol>}
  </div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-2"
    >
      <div ref={containerRef} className="w-full max-w-4xl px-2 md:px-4">
        {/* 閉じるボタン（上部） */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-end mb-2"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-gray-300 border-2 border-gray-600 font-display text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            ✕ 閉じる
          </motion.button>
        </motion.div>

        {/* ゲームキャンバス */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`game-shell relative bg-gray-900 border-4 border-cyan-400 rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/30 ${gameState === 'win' || gameState === 'gameover' ? 'game-shell--result' : ''}`}
        >
          <canvas
            ref={canvasRef}
            className="block w-full touch-none"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* ゲームオーバー画面 */}
          {gameState === 'gameover' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div className="game-result-panel text-center space-y-3 p-4 md:p-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block px-8 py-4 bg-fuchsia-700 border-4 border-pink-300 shadow-lg shadow-fuchsia-500/30"
                >
                  <h3 className="text-2xl md:text-3xl text-white font-display">
                    ゲームオーバー
                  </h3>
                </motion.div>
                <div className="space-y-2">
                  <p className="text-xl md:text-2xl text-cyan-300 font-display">
                    スコア：{score}
                  </p>
                  <p className="text-lg text-purple-400 font-display">
                    ハイスコア：{highScore}
                  </p>
                </div>
                {scoreRegistration(false)}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white border-4 border-cyan-100 font-display text-sm rounded-lg shadow-lg shadow-cyan-500/30"
                  >
                    もう一度
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-8 py-4 bg-gray-700 text-white border-4 border-gray-500 font-display text-sm rounded-lg"
                  >
                    終了
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 勝利画面 */}
          {gameState === 'win' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div className="game-result-panel text-center space-y-3 p-4 md:p-8">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-300 to-fuchsia-400 border-4 border-cyan-100 shadow-lg shadow-fuchsia-500/30"
                >
                  <h3 className="text-2xl md:text-3xl text-white font-display">
                    🎉 クリア！ 🎉
                  </h3>
                </motion.div>
                <p className="text-xl md:text-2xl text-cyan-300 font-display">
                  スコア：{score}
                </p>
                <p className="text-sm md:text-base text-pink-200 font-display">
                  速攻＋残機ボーナス：+{runBonus}
                </p>
                {scoreRegistration(true)}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-4 border-white font-display text-sm rounded-lg shadow-lg"
                  >
                    もう一度
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-8 py-4 bg-gray-700 text-white border-4 border-gray-500 font-display text-sm rounded-lg"
                  >
                    終了
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 操作説明（PCのみ） */}
        <div className="hidden md:flex justify-center gap-2 mt-2 text-xs text-gray-400">
          <span className="px-2 py-1 bg-gray-800 rounded">⬌ パドル移動</span>
          <span className="px-2 py-1 bg-gray-800 rounded">端打ち → 次の破壊 ×2</span>
          <span className="px-2 py-1 bg-gray-800 rounded">連続破壊 → 最大 ×4</span>
          <span className="px-2 py-1 bg-gray-800 rounded">ESC 一時停止</span>
        </div>
      </div>
    </motion.div>
  );
}
