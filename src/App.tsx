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
const MOBILE_BREAKPOINT = 600;

const GameContainer = styled(Paper)`
  && {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #ffffff 0%, #f5f0ff 100%);
    border: none;
    overflow: hidden;
    touch-action: none;

    @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
      justify-content: flex-start;
      padding-top: 120px;
    }
  }
`;

const GameBoard = styled(Box)`
  position: relative;
  width: ${props => GRID_SIZE * getCellSize()}px;
  height: ${props => GRID_SIZE * getCellSize()}px;
  border: 2px solid #8b5cf6;
  border-radius: 8px;
  background: #faf5ff;
  box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.1);
  margin: 10px 0;
`;

const Cell = styled(Box)<{ 
  $isSnake?: boolean; 
  $isHead?: boolean; 
  color?: string;
}>`
  position: absolute;
  width: ${props => getCellSize()}px;
  height: ${props => getCellSize()}px;
  background: ${({ $isSnake, color }) =>
    $isSnake ? color : 'transparent'};
  border-radius: ${({ $isHead }) => ($isHead ? '8px' : '4px')};
  transition: left ${INITIAL_SPEED}ms linear, top ${INITIAL_SPEED}ms linear;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ $isSnake }) =>
    $isSnake ? '0 2px 4px rgba(124, 58, 237, 0.2)' : 'none'};
  ${({ $isHead }) => $isHead && `
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    box-shadow: 0 2px 6px rgba(109, 40, 217, 0.3);
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
  width: ${props => getCellSize()}px;
  height: ${props => getCellSize()}px;
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

const LogoLink = styled.a`
  position: absolute;
  height: 80px;
  
  @media (min-width: ${MOBILE_BREAKPOINT}px) {
    top: 20px;
    left: 20px;
    transition: transform 0.2s ease;
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    transition: none;
  }
`;

const LogoImage = styled.img`
  height: 100%;
  width: auto;
`;

const getCellSize = () => {
  if (typeof window === 'undefined') return CELL_SIZE;
  return window.innerWidth < MOBILE_BREAKPOINT ? 
    Math.floor((window.innerWidth - 40) / GRID_SIZE) : 
    CELL_SIZE;
};

// Function to generate gradient colors based on index
const getSnakeColor = (index: number) => {
  const baseColor = 200; // Base hue for the gradient
  const hue = (baseColor + index * 20) % 360; // Adjust hue for each segment
  return `hsl(${hue}, 100%, 50%)`; // HSL color format
};

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
  const [touchStart, setTouchStart] = useState<Position | null>(null);
  const [cellSize, setCellSize] = useState(getCellSize());

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

  useEffect(() => {
    const handleResize = () => {
      setCellSize(getCellSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !canChangeDirection) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0 && direction !== 'left') {
          setDirection('right');
          setCanChangeDirection(false);
        } else if (deltaX < 0 && direction !== 'right') {
          setDirection('left');
          setCanChangeDirection(false);
        }
        setTouchStart(null);
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0 && direction !== 'up') {
          setDirection('down');
          setCanChangeDirection(false);
        } else if (deltaY < 0 && direction !== 'down') {
          setDirection('up');
          setCanChangeDirection(false);
        }
        setTouchStart(null);
      }
    }
  };

  return (
    <GameContainer 
      elevation={3}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <LogoLink 
        href="https://nlogn.info" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <LogoImage 
          src="https://contest.nlogn.info/img/nlogn-logo.svg" 
          alt="nlogn logo"
        />
      </LogoLink>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: '#8b5cf6',
          fontWeight: 'bold',
          mt: { xs: 0, sm: 0 },
          mb: { xs: 1, sm: 2 }
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
            color={getSnakeColor(index)}
            style={{
              left: segment.x * cellSize,
              top: segment.y * cellSize,
            }}
          />
        ))}
        <FoodCell
          style={{
            left: food.x * cellSize,
            top: food.y * cellSize,
          }}
        >
          <CoffeeIcon 
            sx={{ 
              color: '#6d4c41',
              fontSize: cellSize - 5,
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
        sx={{ 
          color: '#6d28d9',
          display: { xs: 'block', sm: 'none' },
          mt: 1,
          mb: 2
        }}
      >
        Используйте свайпы для управления
      </Typography>
    </GameContainer>
  );
};

export default App;
