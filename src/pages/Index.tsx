import { AppSidebar } from "@/components/AppSidebar";
import { CommonSites } from "@/components/CommonSites";
import { Announcements } from "@/components/Announcements";
import { CalendarView } from "@/components/CalendarView";
import { SearchDialog } from "@/components/SearchDialog";
import { FavoritesDialog } from "@/components/FavoritesDialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { School } from "lucide-react";

const Index = () => {
  const commonSitesAnim = useScrollAnimation();
  const announcementsAnim = useScrollAnimation();
  const calendarAnim = useScrollAnimation();
  const countdownAnim = useScrollAnimation();

  // 設定段考日期 - 台灣時區 (GMT+8)
  // 格式：Date.UTC(年, 月-1, 日, 時-8, 分, 秒) - 需要減8小時來設定為台灣時間
  const examDate = new Date(Date.UTC(2025, 10, 27, -8, 0, 0)); // 第二次段考：11/27 台灣時間 00:00
  const examStartDate = new Date(Date.UTC(2025, 9, 16, -8, 0, 0)); // 學期開始日期

  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-primary/20">
          <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg">
                <School className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                崇明國中
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <SearchDialog />
              <FavoritesDialog />
              <AppSidebar />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <div className="space-y-12">
            <div
              ref={countdownAnim.ref}
              className={`transition-all duration-700 ${
                countdownAnim.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <CountdownTimer 
                targetDate={examDate} 
                startDate={examStartDate}
                label="第二次段考倒數計時 (11/27-11/28)" 
              />
            </div>

            <div
              ref={commonSitesAnim.ref}
              className={`transition-all duration-700 ${
                commonSitesAnim.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <CommonSites />
            </div>

            <div
              ref={announcementsAnim.ref}
              className={`transition-all duration-700 delay-100 ${
                announcementsAnim.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <Announcements />
            </div>

            <div
              ref={calendarAnim.ref}
              className={`transition-all duration-700 delay-200 ${
                calendarAnim.isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <CalendarView />
            </div>
          </div>
        </main>

        <footer className="border-t border-primary/20 bg-gradient-to-r from-background to-primary/5 py-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
            <p>© 2025 崇明國中 by nocfond</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
