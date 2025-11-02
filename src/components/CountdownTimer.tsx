import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CountdownTimerProps {
  targetDate: Date;
  startDate?: Date;
  label: string;
}

export function CountdownTimer({ targetDate, startDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const getTaiwanTime = () => {
      const now = new Date();
      return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (8 * 60 * 60 * 1000));
    };

    const calculateTimeLeft = () => {
      const taiwanNow = getTaiwanTime();
      const difference = targetDate.getTime() - taiwanNow.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    const calculateProgress = () => {
      const taiwanNow = getTaiwanTime();
      const target = targetDate.getTime();
      const start = startDate ? startDate.getTime() : taiwanNow.getTime() - (7 * 24 * 60 * 60 * 1000);
      const total = target - start;
      const elapsed = taiwanNow.getTime() - start;
      const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
      return percentage;
    };

    setTimeLeft(calculateTimeLeft());
    setProgress(calculateProgress());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
      setProgress(calculateProgress());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, startDate]);

  const isComplete = progress >= 100;

  if (!timeLeft && !isComplete) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{label}</h3>
      </div>
      
      {!isComplete ? (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { value: timeLeft?.days || 0, label: "天" },
            { value: timeLeft?.hours || 0, label: "時" },
            { value: timeLeft?.minutes || 0, label: "分" },
            { value: timeLeft?.seconds || 0, label: "秒" },
          ].map((item, idx) => (
            <div key={idx} className="bg-card rounded-lg p-3 text-center border border-border">
              <div className="text-2xl font-bold text-primary">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            已到達
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>上次至本次段考剩餘進度</span>
          <span>{isComplete ? "100% 完成" : `${(100 - progress).toFixed(1)}% 剩餘`}</span>
        </div>
        <Progress value={progress} gradient className="h-2" />
        {isComplete && (
          <div className="text-center mt-3 text-base font-semibold text-primary animate-fade-in">
            ✓ 已到達
          </div>
        )}
      </div>
    </div>
  );
}
