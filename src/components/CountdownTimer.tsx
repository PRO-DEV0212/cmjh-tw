import { useEffect, useState } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface CountdownConfig {
  targetDate: Date;
  startDate?: Date;
  label: string;
  progressLabel: string;
}

// 輔助函數：直接輸入台灣時間，自動轉換為正確的 Date 對象
// 使用方式：taiwanTime(年, 月, 日, 時, 分, 秒)
// 例如：taiwanTime(2025, 11, 13, 0, 0, 0) 代表 2025年11月13日 00:00 台灣時間
const taiwanTime = (year: number, month: number, day: number, hour = 0, minute = 0, second = 0): Date => {
  // 台灣時區是 UTC+8，所以要減去 8 小時來得到 UTC 時間
  return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));
};

// 倒數計時配置列表 - 可以直接在這裡修改
// 現在可以直接輸入台灣時間，不用再計算時區了！
const countdownConfigs: CountdownConfig[] = [
  {
    targetDate: taiwanTime(2025, 11, 27, 0, 0, 0), // 2025年11月13日 00:00
    startDate: taiwanTime(2025, 10, 16, 0, 0, 0),   // 2025年10月3日 00:00
    label: "第二次段考倒數 11/27 11/28",
    progressLabel: "上次至本次段考進度條"
  },
  {
    targetDate: taiwanTime(2026, 1, 1, 0, 0, 0),   // 2026年1月1日 00:00
    startDate: taiwanTime(2025, 1, 1, 0, 0, 0),    // 2025年1月1日 00:00
    label: "2026年倒數",
    progressLabel: "2025年進度條"
  }
];

interface CountdownTimerProps {}

export function CountdownTimer({}: CountdownTimerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [progress, setProgress] = useState(0);

  const currentConfig = countdownConfigs[currentIndex];
  const { targetDate, startDate, label, progressLabel } = currentConfig;

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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + countdownConfigs.length) % countdownConfigs.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % countdownConfigs.length);
  };

  const isComplete = progress >= 100;

  if (!timeLeft && !isComplete) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{label}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {currentIndex + 1}/{countdownConfigs.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
          <span>{progressLabel}</span>
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
