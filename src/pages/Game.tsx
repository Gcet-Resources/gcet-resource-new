
import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Game = () => {
  const { toast } = useToast();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    moveButton();
  };

  const endGame = () => {
    setGameActive(false);
    toast({
      title: "Game Over!",
      description: `Your final score: ${score}`,
    });
  };

  const moveButton = () => {
    if (gameActive) {
      const newX = Math.random() * (window.innerWidth - 100);
      const newY = Math.random() * (window.innerHeight - 100);
      setPosition({ x: newX, y: newY });
    }
  };

  const handleClick = () => {
    if (gameActive) {
      setScore((prev) => prev + 1);
      moveButton();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <Card className="max-w-2xl mx-auto p-8 text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-6">
            You are not allowed
          </h1>
          <p className="text-gray-600 mb-8">
            Try to click the moving button as many times as you can in 30 seconds!
          </p>
          {!gameActive ? (
            <Button onClick={startGame} className="w-48">
              Start Game
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-around text-lg">
                <span>Score: {score}</span>
                <span>Time: {timeLeft}s</span>
              </div>
            </div>
          )}
        </Card>

        {gameActive && (
          <div className="relative h-[60vh]">
            <Button
              className="absolute transition-all duration-200 animate-bounce"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
              onClick={handleClick}
            >
              Click me!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
