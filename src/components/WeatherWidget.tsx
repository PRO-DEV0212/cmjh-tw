import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, MapPin, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_KEY = "CWA-6AEC6F91-948A-464F-9DC1-AC1B8361153D";
const TAINAN_CODE = "F-D0047-079";

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
  const [error, setError] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchWeather = async (town?: string) => {
    setLoading(true);
    setError("");
    
    try {
      const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${TAINAN_CODE}?Authorization=${API_KEY}`;
      
      console.log("🌐 請求 URL:", url);
      
      const response = await fetch(url);
      
      console.log("📡 Response Status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ⭐ 完整打印 API 結構
      console.log("📦 完整 API 回應:", JSON.stringify(data, null, 2));
      setDebugInfo(data);

      // ⭐ 檢查各種可能的結構
      console.log("🔍 檢查資料結構:");
      console.log("  - data.success:", data.success);
      console.log("  - data.records:", data.records ? "✅ 存在" : "❌ 不存在");
      console.log("  - data.records.locations:", data.records?.locations ? "✅ 存在" : "❌ 不存在");
      console.log("  - data.records.location:", data.records?.location ? "✅ 存在" : "❌ 不存在");
      
      if (data.records?.locations) {
        console.log("  - locations 陣列長度:", data.records.locations.length);
        console.log("  - locations[0]:", data.records.locations[0]);
      }

      // ⭐ 嘗試多種可能的路徑
      let locations = null;
      
      // 路徑 1: records.locations[0].location
      if (data.records?.locations?.[0]?.location) {
        locations = data.records.locations[0].location;
        console.log("✅ 使用路徑: records.locations[0].location");
      }
      // 路徑 2: records.location
      else if (data.records?.location) {
        locations = data.records.location;
        console.log("✅ 使用路徑: records.location");
      }
      // 路徑 3: records.locations (直接是陣列)
      else if (Array.isArray(data.records?.locations)) {
        locations = data.records.locations;
        console.log("✅ 使用路徑: records.locations");
      }

      if (data.success === "true" && locations) {
        console.log("✅ 成功取得地點資料");
        console.log("📍 地點數量:", locations.length);
        console.log("📍 地點列表:", locations.map((loc: any) => loc.locationName));
        
        const townNames = locations.map((loc: any) => loc.locationName);
        setTowns(townNames);

        const targetTown = town || selectedTown || townNames[0];
        setSelectedTown(targetTown);

        const townData = locations.find((loc: any) => loc.locationName === targetTown);
        
        if (townData) {
          console.log("✅ 找到目標鄉鎮:", targetTown);
          console.log("📊 天氣元素:", townData.weatherElement?.map((e: any) => e.elementName));
          setWeatherData(townData);
        } else {
          setError(`找不到 ${targetTown} 的天氣資料`);
        }
      } else {
        console.error("❌ 無法解析資料結構");
        console.error("完整回應:", data);
        setError(`資料結構異常。請查看控制台的完整輸出。`);
      }
      
    } catch (error: any) {
      console.error("💥 錯誤:", error);
      setError(error.message);
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

  const getDailyForecast = (): DailyWeather[] => {
    if (!weatherData?.weatherElement) {
      console.warn("⚠️ weatherData 或 weatherElement 不存在");
      return [];
    }

    try {
      const wxElement = weatherData.weatherElement.find(e => e.elementName === "Wx");
      const minTElement = weatherData.weatherElement.find(e => e.elementName === "MinT");
      const maxTElement = weatherData.weatherElement.find(e => e.elementName === "MaxT");
      const popElement = weatherData.weatherElement.find(e => e.elementName === "PoP12h");
      const ciElement = weatherData.weatherElement.find(e => e.elementName === "CI");
      const rhElement = weatherData.weatherElement.find(e => e.elementName === "RH");
      const wsElement = weatherData.weatherElement.find(e => e.elementName === "WS");

      console.log("🔍 可用的天氣元素:", {
        Wx: !!wxElement,
        MinT: !!minTElement,
        MaxT: !!maxTElement,
        PoP12h: !!popElement,
        CI: !!ciElement,
        RH: !!rhElement,
        WS: !!wsElement,
      });

      if (!wxElement?.time || wxElement.time.length === 0) {
        console.warn("⚠️ 沒有天氣時間資料");
        return [];
      }

      console.log("📅 時間資料筆數:", wxElement.time.length);

      const dailyMap = new Map<string, any[]>();

      wxElement.time.forEach((timeSlot, index) => {
        const date = new Date(timeSlot.startTime);
        const dateKey = date.toISOString().split('T')[0];

        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, []);
        }

        dailyMap.get(dateKey)?.push({
          wx: wxElement.time[index]?.elementValue[0]?.value || "N/A",
          minTemp: minTElement?.time[index]?.elementValue[0]?.value || "0",
          maxTemp: maxTElement?.time[index]?.elementValue[0]?.value || "0",
          pop: popElement?.time[index]?.elementValue[0]?.value || "0",
          ci: ciElement?.time[index]?.elementValue[0]?.value || "N/A",
          rh: rhElement?.time[index]?.elementValue[0]?.value || "0",
          ws: wsElement?.time[index]?.elementValue[0]?.value || "0",
        });
      });

      console.log("📊 整理後的天數:", dailyMap.size);

      const dailyForecasts: DailyWeather[] = [];
      let dayCount = 0;

      for (const [dateKey, slots] of Array.from(dailyMap.entries())) {
        if (dayCount >= 3) break;

        const date = new Date(dateKey);
        const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        let dayLabel = `第${diffDays}天`;
        if (diffDays === 0) dayLabel = "今天";
        else if (diffDays === 1) dayLabel = "明天";
        else if (diffDays === 2) dayLabel = "後天";

        const wxList = slots.map(s => s.wx).filter(w => w !== "N/A");
        const mostCommonWx = wxList.length > 0 ? wxList[0] : "多雲";

        const minTemps = slots.map(s => parseFloat(s.minTemp)).filter(t => !isNaN(t));
        const maxTemps = slots.map(s => parseFloat(s.maxTemp)).filter(t => !isNaN(t));
        const minTemp = minTemps.length > 0 ? Math.min(...minTemps) : 20;
        const maxTemp = maxTemps.length > 0 ? Math.max(...maxTemps) : 28;

        const pops = slots.map(s => parseInt(s.pop)).filter(p => !isNaN(p));
        const maxPop = pops.length > 0 ? Math.max(...pops) : 0;

        const rhs = slots.map(s => parseInt(s.rh)).filter(r => !isNaN(r));
        const avgRh = rhs.length > 0 ? Math.round(rhs.reduce((a, b) => a + b, 0) / rhs.length) : 70;

        dailyForecasts.push({
          date: dateKey,
          dateDisplay: `${date.getMonth() + 1}/${date.getDate()} 週${dayOfWeek}`,
          dayLabel,
          wx: mostCommonWx,
          minTemp,
          maxTemp,
          pop: maxPop.toString(),
          ci: slots[0]?.ci || "舒適",
          rh: avgRh.toString(),
          ws: slots[0]?.ws || "微風",
          wd: "東南風",
        });

        dayCount++;
      }

      console.log("✅ 成功產生", dailyForecasts.length, "天預報");
      return dailyForecasts;
      
    } catch (err) {
      console.error("❌ 處理天氣資料錯誤:", err);
      return [];
    }
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
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">無法載入天氣資料</p>
              <p className="text-sm mt-1">{error}</p>
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer underline">查看除錯資訊</summary>
                <pre className="mt-2 p-2 bg-black/10 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
              <button 
                onClick={() => fetchWeather()} 
                className="text-sm underline mt-2 block"
              >
                點擊重試
              </button>
            </AlertDescription>
          </Alert>
        )}

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
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold">{day.dayLabel}</p>
                      <p className="text-xs text-muted-foreground">{day.dateDisplay}</p>
                    </div>
                    <div className="text-primary">
                      {getWeatherIcon(day.wx)}
                    </div>
                  </div>

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

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span className="text-muted-foreground">降雨</span>
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
        ) : !error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">暫無天氣資料</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
