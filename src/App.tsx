import { useEffect, useCallback, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import styled from 'styled-components';
import CoffeeIcon from '@mui/icons-material/Coffee';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 100;

const GameContainer = styled(Paper)`
  && {
    padding: 20px;
    margin: 20px auto;
    max-width: ${GRID_SIZE * CELL_SIZE + 40}px;
    text-align: center;
    background: linear-gradient(145deg, #ffffff 0%, #f5f0ff 100%);
    border: 2px solid #8b5cf6;
  }
`;

const GameBoard = styled(Box)`
  position: relative;
  width: ${GRID_SIZE * CELL_SIZE}px;
  height: ${GRID_SIZE * CELL_SIZE}px;
  border: 2px solid #8b5cf6;
  border-radius: 8px;
  margin: 20px auto;
  background: #faf5ff;
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.1);
  will-change: transform;
  backface-visibility: hidden;
`;

const Cell = styled(Box)<{ 
  $isSnake?: boolean; 
  $isHead?: boolean;
}>`
  position: absolute;
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background-color: ${({ $isSnake }) =>
    $isSnake ? '#8b5cf6' : 'transparent'};
  border-radius: ${({ $isHead }) => ($isHead ? '8px' : '4px')};
  transition: left ${INITIAL_SPEED}ms linear, top ${INITIAL_SPEED}ms linear;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $isHead }) => $isHead && `
    &::before,
    &::after {
      content: '';
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: white;
      border-radius: 50%;
      top: 8px;
    }
    &::before {
      left: 6px;
    }
    &::after {
      right: 6px;
    }
  `}
`;

const FoodCell = styled(Box)`
  position: absolute;
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: left ${INITIAL_SPEED}ms linear, top ${INITIAL_SPEED}ms linear;
`;

const GameOverModal = styled(Paper)`
  && {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
    text-align: center;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.97);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(139, 92, 246, 0.2);
    border: 2px solid #8b5cf6;
  }
`;

const App = () => {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<string>('right');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [canChangeDirection, setCanChangeDirection] = useState(true);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
    ]);
    setDirection('right');
    setIsGameOver(false);
    setScore(0);
    setCanChangeDirection(true);
    generateFood();
  };

  const checkCollision = (head: Position): boolean => {
    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // Check self collision
    return snake.some((segment) => segment.x === head.x && segment.y === head.y);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    setSnake((currentSnake) => {
      const head = { ...currentSnake[0] };

      switch (direction) {
        case 'up':
          head.y -= 1;
          break;
        case 'down':
          head.y += 1;
          break;
        case 'left':
          head.x -= 1;
          break;
        case 'right':
          head.x += 1;
          break;
      }

      if (checkCollision(head)) {
        setIsGameOver(true);
        return currentSnake;
      }

      const newSnake = [head, ...currentSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(score + 1);
        generateFood();
      } else {
        newSnake.pop();
      }

      setCanChangeDirection(true);
      return newSnake;
    });
  }, [direction, food.x, food.y, generateFood, isGameOver, score]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!canChangeDirection) return;
      
      const key = e.key.toLowerCase();
      let newDirection = direction;

      switch (key) {
        case 'arrowup':
        case 'w':
          if (direction !== 'down') newDirection = 'up';
          break;
        case 'arrowdown':
        case 's':
          if (direction !== 'up') newDirection = 'down';
          break;
        case 'arrowleft':
        case 'a':
          if (direction !== 'right') newDirection = 'left';
          break;
        case 'arrowright':
        case 'd':
          if (direction !== 'left') newDirection = 'right';
          break;
        default:
          return;
      }

      if (newDirection !== direction) {
        setDirection(newDirection);
        setCanChangeDirection(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, canChangeDirection]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <GameContainer elevation={3}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: '#8b5cf6',
          fontWeight: 'bold'
        }}
      >
        Змейка
      </Typography>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          color: '#6d28d9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        Кофе: {score}
        <CoffeeIcon 
          sx={{ 
            color: '#6d4c41',
            fontSize: '24px'
          }} 
        />
      </Typography>
      <GameBoard>
        {snake.map((segment, index) => (
          <Cell
            key={index}
            $isSnake
            $isHead={index === 0}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
            }}
          />
        ))}
        <FoodCell
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        >
          <CoffeeIcon 
            sx={{ 
              color: '#6d4c41',
              fontSize: CELL_SIZE - 5,
              filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.2))'
            }} 
          />
        </FoodCell>
        {isGameOver && (
          <GameOverModal>
            <Typography 
              variant="h4" 
              sx={{ color: '#dc2626' }} 
              gutterBottom
            >
              Игра окончена!
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ color: '#6d28d9' }}
              gutterBottom
            >
              Собрано кофе: {score}
            </Typography>
            <Button
              variant="contained"
              onClick={resetGame}
              sx={{ 
                mt: 2,
                bgcolor: '#8b5cf6',
                '&:hover': {
                  bgcolor: '#6d28d9'
                }
              }}
            >
              Играть снова
            </Button>
          </GameOverModal>
        )}
      </GameBoard>
      <Typography 
        variant="body2" 
        sx={{ color: '#6d28d9' }} 
        mt={2}
      >
        Используйте WASD или стрелки для управления
      </Typography>
    </GameContainer>
  );
};

export default App;
