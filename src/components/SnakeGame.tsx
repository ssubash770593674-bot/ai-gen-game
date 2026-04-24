import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Direction, Point, GameState } from '../types';

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
  accentColor: string;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION: Direction = 'UP';
const SPEED = 100;

export const SnakeGame: React.FC<SnakeGameProps> = ({ onScoreChange, accentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('snake-highscore') || '0', 10),
    isGameOver: false,
    isPaused: true,
  });

  const nextDirection = useRef<Direction>(INITIAL_DIRECTION);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    nextDirection.current = INITIAL_DIRECTION;
    const initialFood = generateFood(INITIAL_SNAKE);
    setFood(initialFood);
    setGameState(prev => ({ ...prev, score: 0, isGameOver: false, isPaused: false }));
    onScoreChange(0);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') nextDirection.current = 'UP'; break;
        case 'ArrowDown': if (direction !== 'UP') nextDirection.current = 'DOWN'; break;
        case 'ArrowLeft': if (direction !== 'RIGHT') nextDirection.current = 'LEFT'; break;
        case 'ArrowRight': if (direction !== 'LEFT') nextDirection.current = 'RIGHT'; break;
        case ' ': 
          if (gameState.isGameOver) resetGame();
          else setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameState.isGameOver]);

  useEffect(() => {
    if (gameState.isPaused || gameState.isGameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const currentDir = nextDirection.current;
        setDirection(currentDir);

        switch (currentDir) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleGameOver();
          return prevSnake;
        }

        // Self
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food
        if (head.x === food.x && head.y === food.y) {
          setGameState(prev => {
            const newScore = prev.score + 10;
            onScoreChange(newScore);
            return { ...prev, score: newScore };
          });
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, SPEED);
    return () => clearInterval(gameInterval);
  }, [food, gameState.isPaused, gameState.isGameOver, generateFood, onScoreChange]);

  const handleGameOver = () => {
    setGameState(prev => {
      const newHigh = Math.max(prev.score, prev.highScore);
      localStorage.setItem('snake-highscore', newHigh.toString());
      return { ...prev, isGameOver: true, highScore: newHigh };
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width / GRID_SIZE;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath(); ctx.moveTo(i * size, 0); ctx.lineTo(i * size, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * size); ctx.lineTo(canvas.width, i * size); ctx.stroke();
    }

    // Food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = accentColor;
    ctx.fillStyle = accentColor;
    snake.forEach((segment, i) => {
      ctx.fillRect(segment.x * size + 1, segment.y * size + 1, size - 2, size - 2);
    });

  }, [snake, food, accentColor]);

  return (
    <div className="relative group overflow-hidden border-4 border-[#111] bg-black shadow-[0_0_50px_rgba(0,0,0,1)]">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="block max-w-full aspect-square"
      />
      
      {(gameState.isPaused || gameState.isGameOver) && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md z-20">
          {gameState.isGameOver ? (
            <div className="space-y-4">
              <h2 className="text-5xl font-black italic tracking-tighter neon-text-magenta">SYSTEM FAILURE</h2>
              <p className="text-lg opacity-80 font-mono">SCORE: {gameState.score}</p>
              <button 
                onClick={resetGame}
                className="px-10 py-4 bg-white text-black font-black italic tracking-tighter text-xl rounded-none hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform"
              >
                REBOOT_SYSTEM
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-6xl font-black italic tracking-tighter neon-text-cyan">READY_</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">INPUT REQUIRED: ARROW KEYS</p>
              <button 
                onClick={() => setGameState(prev => ({ ...prev, isPaused: false }))}
                className="px-10 py-4 bg-white text-black font-black italic tracking-tighter text-xl rounded-none hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-transform"
              >
                INITIATE_PULSE
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* HUD overlays */}
      <div className="absolute top-4 left-4 font-mono text-[10px] opacity-30 pointer-events-none uppercase tracking-widest">
        LOG_POS: {snake[0].x}.{snake[0].y}
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-[#ff00ff] pointer-events-none uppercase tracking-widest font-bold">
        HIGH_CORE: {gameState.highScore}
      </div>
    </div>
  );
};
