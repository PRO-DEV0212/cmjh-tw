import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const API_KEY = "CWA-6AEC6F91-948A-464F-9DC1-AC1B8361153D";
const TAINAN_CODE = "F-D0047-079"; // 台南市代碼

interface WeatherElement {
  elementName: string;
  time: Array<{
    startTime: string;
    endTime: string;
    elementValue: Array<{
      value: string;
      measures?: string;
    }>;
  }>;
}

interface TownWeatherData {
  locationName: string;
  weatherElement: WeatherElement[];
}

interface DailyWeather {
  date: string;
  dateDisplay: string;
  dayLabel: string;
  wx: string;
  minTemp: number;
  maxTemp: number;
  pop: string;
  rh: string;
  ws: string;
  wd: string;
  ci: string;
}

export const WeatherWidget = () => {
  const [selectedTown, setSelectedTown] = useState<string>("");
  const [towns, setTowns] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<TownWeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async (town?: string) => {
    setLoading(true);
    try {
      // ⭐ 修正：使用反引號
      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${TAINAN_CODE}?Authorization=${API_KEY}`
      );
      const data = await response.json();

      console.log("API Response:", data); // 除錯用

      if (data.success === "true" && data.records?.locations?.[0]?.location) {
        const locations = data.records.locations[0].location;
        const townNames = locations.map((loc: any) => loc.locationName);
        setTowns(townNames);

        const targetTown = town || selectedTown || townNames[0];
        setSelectedTown(targetTown);

        const townData = locations.find((loc: any) => loc.locationName === targetTown);
        if (townData) {
          setWeatherData(townData);
        }
      } else {
        console.error("API 返回錯誤:", data);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (selectedTown && towns.includes(selectedTown)) {
      fetchWeather(selectedTown);
    }
  }, [selectedTown]);

  const getWeatherIcon = (wx: string) => {
    if (wx.includes("雨")) return <CloudRain className="h-8 w-8" />;
    if (wx.includes("雪")) return <CloudSnow className="h-8 w-8" />;
    if (wx.includes("雲") || wx.includes("陰")) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  // ⭐ 新增：將時段資料整理成每日資料
  const getDailyForecast = (): DailyWeather[] => {
    if (!weatherData) return [];

    const wxElement = weatherData.weatherElement.find(e => e.elementName === "Wx");
    const minTElement = weatherData.weatherElement.find(e => e.elementName === "MinT");
    const maxTElement = weatherData.weatherElement.find(e => e.elementName === "MaxT");
    const popElement = weatherData.weatherElement.find(e => e.elementName === "PoP12h");
    const ciElement = weatherData.weatherElement.find(e => e.elementName === "CI");
    const rhElement = weatherData.weatherElement.find(e => e.elementName === "RH");
    const wsElement = weatherData.weatherElement.find(e => e.elementName === "WS");
    const wdElement = weatherData.weatherElement.find(e => e.elementName === "WD");

    // 按日期分組
    const dailyMap = new Map<string, any[]>();

    wxElement?.time.forEach((timeSlot, index) => {
      const date = new Date(timeSlot.startTime);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }

      dailyMap.get(dateKey)?.push({
        wx: wxElement.time[index]?.elementValue[0]?.value || "N/A",
        minTemp: minTElement?.time[index]?.elementValue[0]?.value || null,
        maxTemp: maxTElement?.time[index]?.elementValue[0]?.value || null,
        pop: popElement?.time[index]?.elementValue[0]?.value || "0",
        ci: ciElement?.time[index]?.elementValue[0]?.value || "N/A",
        rh: rhElement?.time[index]?.elementValue[0]?.value || "N/A",
        ws: wsElement?.time[index]?.elementValue[0]?.value || "N/A",
        wd: wdElement?.time[index]?.elementValue[0]?.value || "N/A",
      });
    });

    // 轉換為每日摘要（取前3天）
    const dailyForecasts: DailyWeather[] = [];
    let dayCount = 0;

    for (const [dateKey, slots] of Array.from(dailyMap.entries())) {
      if (dayCount >= 3) break;

      const date = new Date(dateKey);
      const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let dayLabel = "";
      const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) dayLabel = "今天";
      else if (diffDays === 1) dayLabel = "明天";
      else if (diffDays === 2) dayLabel = "後天";

      // 找出最常見的天氣狀況
      const wxList = slots.map(s => s.wx).filter(w => w !== "N/A");
      const mostCommonWx = wxList.length > 0 ? wxList[0] : "N/A";

      // 取得最高/最低溫
      const minTemps = slots.map(s => parseFloat(s.minTemp)).filter(t => !isNaN(t));
      const maxTemps = slots.map(s => parseFloat(s.maxTemp)).filter(t => !isNaN(t));
      const minTemp = minTemps.length > 0 ? Math.min(...minTemps) : 0;
      const maxTemp = maxTemps.length > 0 ? Math.max(...maxTemps) : 0;

      // 取得最高降雨機率
      const pops = slots.map(s => parseInt(s.pop)).filter(p => !isNaN(p));
      const maxPop = pops.length > 0 ? Math.max(...pops) : 0;

      dailyForecasts.push({
        date: dateKey,
        dateDisplay: `${date.getMonth() + 1}/${date.getDate()} 週${dayOfWeek}`,
        dayLabel,
        wx: mostCommonWx,
        minTemp,
        maxTemp,
        pop: maxPop.toString(),
        ci: slots[0]?.ci || "N/A",
        rh: slots[0]?.rh || "N/A",
        ws: slots[0]?.ws || "N/A",
        wd: slots[0]?.wd || "N/A",
      });

      dayCount++;
    }

    return dailyForecasts;
  };

  const dailyForecast = getDailyForecast();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            台南市天氣預報
          </CardTitle>
          <MapPin className="h-5 w-5 text-primary" />
        </div>

        {/* 鄉鎮選擇 */}
        {towns.length > 0 && (
          <Select value={selectedTown} onValueChange={setSelectedTown}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="選擇鄉鎮區" />
            </SelectTrigger>
            <SelectContent>
              {towns.map((town) => (
                <SelectItem key={town} value={town}>
                  {town}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        ) : dailyForecast.length > 0 ? (
          <>
            <div className="mb-2">
              <p className="text-sm text-muted-foreground">
                {selectedTown} · 未來3天預報
              </p>
            </div>

            {/* 未來3天預報 */}
            <div className="grid grid-cols-1 gap-3">
              {dailyForecast.map((day, index) => (
                <div
                  key={day.date}
                  className={`p-4 rounded-lg border transition-all ${
                    index === 0
                      ? 'bg-gradient-to-br from-primary/15 to-primary/5 border-primary/30 shadow-sm'
                      : 'bg-gradient-to-br from-muted/50 to-muted/30 border-border/50 hover:border-primary/30'
                  }`}
                >
                  {/* 日期標題 */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold">
                        {day.dayLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">{day.dateDisplay}</p>
                    </div>
                    <div className="text-primary">
                      {getWeatherIcon(day.wx)}
                    </div>
                  </div>

                  {/* 天氣與溫度 */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-base font-semibold mb-2">{day.wx}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-orange-600">
                          {Math.round(day.maxTemp)}°
                        </span>
                        <span className="text-xl font-semibold text-blue-600">
                          {Math.round(day.minTemp)}°
                        </span>
                      </div>
                    </div>

                    {/* 詳細資訊 */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">降雨率</span>
                        <span className="font-bold ml-auto text-blue-600">{day.pop}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">風速</span>
                        <span className="font-semibold ml-auto">{day.ws}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-cyan-500" />
                        <span className="text-muted-foreground">濕度</span>
                        <span className="font-semibold ml-auto">{day.rh}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 舒適度 */}
                  {day.ci !== "N/A" && (
                    <div className="pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">
                        舒適度：<span className="font-medium text-foreground">{day.ci}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">無法取得天氣資訊</p>
            <p className="text-xs text-muted-foreground mt-2">請檢查網路連線或稍後再試</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
