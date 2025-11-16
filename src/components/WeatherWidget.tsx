import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, MapPin, Thermometer, Gauge, Eye, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const API_KEY = "CWA-6AEC6F91-948A-464F-9DC1-AC1B8361153D";

// 縣市對應的 API 代碼
const CITIES = [
  { value: "臺北市", label: "臺北市", code: "F-D0047-061" },
  { value: "新北市", label: "新北市", code: "F-D0047-069" },
  { value: "桃園市", label: "桃園市", code: "F-D0047-005" },
  { value: "臺中市", label: "臺中市", code: "F-D0047-073" },
  { value: "臺南市", label: "臺南市", code: "F-D0047-079" },
  { value: "高雄市", label: "高雄市", code: "F-D0047-065" },
  { value: "基隆市", label: "基隆市", code: "F-D0047-049" },
  { value: "新竹市", label: "新竹市", code: "F-D0047-053" },
  { value: "嘉義市", label: "嘉義市", code: "F-D0047-057" },
  { value: "新竹縣", label: "新竹縣", code: "F-D0047-009" },
  { value: "苗栗縣", label: "苗栗縣", code: "F-D0047-013" },
  { value: "彰化縣", label: "彰化縣", code: "F-D0047-017" },
  { value: "南投縣", label: "南投縣", code: "F-D0047-021" },
  { value: "雲林縣", label: "雲林縣", code: "F-D0047-025" },
  { value: "嘉義縣", label: "嘉義縣", code: "F-D0047-029" },
  { value: "屏東縣", label: "屏東縣", code: "F-D0047-033" },
  { value: "宜蘭縣", label: "宜蘭縣", code: "F-D0047-001" },
  { value: "花蓮縣", label: "花蓮縣", code: "F-D0047-041" },
  { value: "臺東縣", label: "臺東縣", code: "F-D0047-037" },
  { value: "澎湖縣", label: "澎湖縣", code: "F-D0047-045" },
  { value: "金門縣", label: "金門縣", code: "F-D0047-085" },
  { value: "連江縣", label: "連江縣", code: "F-D0047-081" },
];

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

interface WeatherInfo {
  time: string;
  startTime: string;
  endTime: string;
  wx: string;              // 天氣現象
  temp: string;            // 溫度
  rh: string;              // 相對濕度
  ws: string;              // 風速
  wd: string;              // 風向
  pop: string;             // 降雨機率
  ci: string;              // 舒適度
  at: string;              // 體感溫度
  uvi: string;             // 紫外線指數
}

export const WeatherWidget = () => {
  const [selectedCity, setSelectedCity] = useState("臺南市");
  const [selectedTown, setSelectedTown] = useState<string>("");
  const [towns, setTowns] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<TownWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const fetchWeather = async (city: string, town?: string) => {
    setLoading(true);
    try {
      const cityData = CITIES.find(c => c.value === city);
      if (!cityData) return;

      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${cityData.code}?Authorization=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.success === "true" && data.records?.locations?.[0]?.location) {
        const locations = data.records.locations[0].location;
        
        // 取得所有鄉鎮名稱
        const townNames = locations.map((loc: any) => loc.locationName);
        setTowns(townNames);
        
        // 選擇特定鄉鎮或第一個
        const targetTown = town || selectedTown || townNames[0];
        setSelectedTown(targetTown);
        
        const townData = locations.find((loc: any) => loc.locationName === targetTown);
        if (townData) {
          setWeatherData(townData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const autoDetectLocation = () => {
    setIsAutoDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude } = position.coords;
          let detectedCity = "臺南市";
          
          if (latitude > 25.0) detectedCity = "臺北市";
          else if (latitude > 24.5) detectedCity = "新竹市";
          else if (latitude > 24.0) detectedCity = "臺中市";
          else if (latitude > 23.0) detectedCity = "臺南市";
          else detectedCity = "高雄市";
          
          setSelectedCity(detectedCity);
          setIsAutoDetecting(false);
        },
        () => {
          setIsAutoDetecting(false);
        }
      );
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (selectedTown && towns.includes(selectedTown)) {
      fetchWeather(selectedCity, selectedTown);
    }
  }, [selectedTown]);

  const getWeatherIcon = (wx: string) => {
    if (wx.includes("雨")) return <CloudRain className="h-8 w-8" />;
    if (wx.includes("雪")) return <CloudSnow className="h-8 w-8" />;
    if (wx.includes("雲") || wx.includes("陰")) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  const getElementValue = (elementName: string, timeIndex: number = 0): string => {
    if (!weatherData) return "N/A";
    const element = weatherData.weatherElement.find(e => e.elementName === elementName);
    return element?.time?.[timeIndex]?.elementValue?.[0]?.value || "N/A";
  };

  const getCurrentWeather = (): WeatherInfo | null => {
    if (!weatherData) return null;
    
    return {
      time: new Date().toLocaleString('zh-TW'),
      startTime: weatherData.weatherElement[0]?.time[0]?.startTime || "",
      endTime: weatherData.weatherElement[0]?.time[0]?.endTime || "",
      wx: getElementValue("Wx", 0),
      temp: getElementValue("T", 0),
      rh: getElementValue("RH", 0),
      ws: getElementValue("WS", 0),
      wd: getElementValue("WD", 0),
      pop: getElementValue("PoP12h", 0),
      ci: getElementValue("CI", 0),
      at: getElementValue("AT", 0),
      uvi: getElementValue("UVI", 0),
    };
  };

  const getForecast = (): WeatherInfo[] => {
    if (!weatherData) return [];
    
    return [0, 1, 2].map(index => ({
      time: weatherData.weatherElement[0]?.time[index]?.startTime || "",
      startTime: weatherData.weatherElement[0]?.time[index]?.startTime || "",
      endTime: weatherData.weatherElement[0]?.time[index]?.endTime || "",
      wx: getElementValue("Wx", index),
      temp: getElementValue("T", index),
      rh: getElementValue("RH", index),
      ws: getElementValue("WS", index),
      wd: getElementValue("WD", index),
      pop: getElementValue("PoP12h", index),
      ci: getElementValue("CI", index),
      at: getElementValue("AT", index),
      uvi: getElementValue("UVI", index),
    }));
  };

  const getUVILevel = (uvi: string) => {
    const level = parseInt(uvi);
    if (level <= 2) return { text: "低量級", color: "text-green-600" };
    if (level <= 5) return { text: "中量級", color: "text-yellow-600" };
    if (level <= 7) return { text: "高量級", color: "text-orange-600" };
    if (level <= 10) return { text: "過量級", color: "text-red-600" };
    return { text: "危險級", color: "text-purple-600" };
  };

  const current = getCurrentWeather();
  const forecast = getForecast();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            天氣資訊
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={autoDetectLocation}
            disabled={isAutoDetecting}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            自動定位
          </Button>
        </div>
        
        {/* 縣市選擇 */}
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((city) => (
              <SelectItem key={city.value} value={city.value}>
                {city.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        ) : current ? (
          <>
            {/* 當前天氣 */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {selectedTown} · 現在天氣
                  </p>
                  <p className="text-xl font-semibold">{current.wx}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-3xl font-bold">{current.temp}°C</span>
                    <span className="text-sm text-muted-foreground">
                      體感 {current.at}°C
                    </span>
                  </div>
                </div>
                <div className="text-primary">
                  {getWeatherIcon(current.wx)}
                </div>
              </div>

              {/* 舒適度 */}
              <div className="mt-3 p-2 bg-background/50 rounded-md">
                <p className="text-sm">
                  <span className="text-muted-foreground">舒適度：</span>
                  <span className="font-medium ml-2">{current.ci}</span>
                </p>
              </div>
            </div>

            {/* 詳細資訊 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 降雨機率 */}
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">降雨機率</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{current.pop}%</p>
              </div>

              {/* 濕度 */}
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-cyan-600" />
                  <span className="text-xs text-muted-foreground">相對濕度</span>
                </div>
                <p className="text-2xl font-bold text-cyan-600">{current.rh}%</p>
              </div>

              {/* 風速 */}
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">風速</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{current.ws}</p>
                <p className="text-xs text-muted-foreground mt-1">m/s</p>
              </div>

              {/* 風向 */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-muted-foreground">風向</span>
                </div>
                <p className="text-xl font-bold text-emerald-600">{current.wd}</p>
              </div>
            </div>

            {/* 紫外線指數 */}
            {current.uvi !== "N/A" && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-muted-foreground">紫外線指數</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{current.uvi}</p>
                    <p className={`text-xs font-medium ${getUVILevel(current.uvi).color}`}>
                      {getUVILevel(current.uvi).text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 未來預報 */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">未來預報</h3>
              <div className="grid grid-cols-3 gap-2">
                {forecast.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(item.startTime).toLocaleDateString('zh-TW', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit'
                      })}
                    </p>
                    <div className="text-primary mb-2 flex justify-center">
                      {getWeatherIcon(item.wx)}
                    </div>
                    <p className="text-xs text-center mb-1 truncate">{item.wx}</p>
                    <p className="text-sm font-semibold text-center">{item.temp}°C</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      <p className="text-xs text-muted-foreground">{item.pop}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 時間範圍提示 */}
            <p className="text-xs text-center text-muted-foreground">
              預報時段：{new Date(current.startTime).toLocaleString('zh-TW', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - {new Date(current.endTime).toLocaleString('zh-TW', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </>
        ) : (
          <p className="text-center text-muted-foreground">無法取得天氣資訊</p>
        )}
      </CardContent>
    </Card>
  );
};
