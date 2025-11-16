import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const API_KEY = "CWA-6AEC6F91-948A-464F-9DC1-AC1B8361153D";

const CITIES = [
  { value: "臺北市", label: "臺北市" },
  { value: "新北市", label: "新北市" },
  { value: "桃園市", label: "桃園市" },
  { value: "臺中市", label: "臺中市" },
  { value: "臺南市", label: "臺南市" },
  { value: "高雄市", label: "高雄市" },
  { value: "基隆市", label: "基隆市" },
  { value: "新竹市", label: "新竹市" },
  { value: "嘉義市", label: "嘉義市" },
  { value: "新竹縣", label: "新竹縣" },
  { value: "苗栗縣", label: "苗栗縣" },
  { value: "彰化縣", label: "彰化縣" },
  { value: "南投縣", label: "南投縣" },
  { value: "雲林縣", label: "雲林縣" },
  { value: "嘉義縣", label: "嘉義縣" },
  { value: "屏東縣", label: "屏東縣" },
  { value: "宜蘭縣", label: "宜蘭縣" },
  { value: "花蓮縣", label: "花蓮縣" },
  { value: "臺東縣", label: "臺東縣" },
  { value: "澎湖縣", label: "澎湖縣" },
  { value: "金門縣", label: "金門縣" },
  { value: "連江縣", label: "連江縣" },
];

interface WeatherData {
  locationName: string;
  weatherElement: {
    elementName: string;
    time: Array<{
      startTime: string;
      endTime: string;
      parameter: {
        parameterName: string;
        parameterValue?: string;
      };
    }>;
  }[];
}

export const WeatherWidget = () => {
  const [selectedCity, setSelectedCity] = useState("臺南市");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const fetchWeather = async (city: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${API_KEY}&locationName=${encodeURIComponent(city)}`
      );
      const data = await response.json();
      
      if (data.success === "true" && data.records?.location?.[0]) {
        setWeatherData(data.records.location[0]);
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
          // 簡單的地理位置對應（實際應用可以使用反向地理編碼API）
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

  const getWeatherIcon = (wx: string) => {
    if (wx.includes("雨")) return <CloudRain className="h-8 w-8" />;
    if (wx.includes("雪")) return <CloudSnow className="h-8 w-8" />;
    if (wx.includes("雲") || wx.includes("陰")) return <Cloud className="h-8 w-8" />;
    return <Sun className="h-8 w-8" />;
  };

  const getCurrentWeather = () => {
    if (!weatherData) return null;
    
    const wx = weatherData.weatherElement.find(e => e.elementName === "Wx");
    const pop = weatherData.weatherElement.find(e => e.elementName === "PoP");
    const minT = weatherData.weatherElement.find(e => e.elementName === "MinT");
    const maxT = weatherData.weatherElement.find(e => e.elementName === "MaxT");
    
    return {
      weather: wx?.time[0]?.parameter?.parameterName || "N/A",
      pop: pop?.time[0]?.parameter?.parameterName || "0",
      minTemp: minT?.time[0]?.parameter?.parameterName || "N/A",
      maxTemp: maxT?.time[0]?.parameter?.parameterName || "N/A",
    };
  };

  const getForecast = () => {
    if (!weatherData) return [];
    
    const wx = weatherData.weatherElement.find(e => e.elementName === "Wx");
    const minT = weatherData.weatherElement.find(e => e.elementName === "MinT");
    const maxT = weatherData.weatherElement.find(e => e.elementName === "MaxT");
    const pop = weatherData.weatherElement.find(e => e.elementName === "PoP");
    
    return wx?.time.slice(0, 3).map((item, index) => ({
      time: new Date(item.startTime).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
      weather: item.parameter.parameterName,
      minTemp: minT?.time[index]?.parameter?.parameterName || "N/A",
      maxTemp: maxT?.time[index]?.parameter?.parameterName || "N/A",
      pop: pop?.time[index]?.parameter?.parameterName || "0",
    })) || [];
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
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        ) : current ? (
          <>
            {/* 當前天氣 */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">現在天氣</p>
                  <p className="text-xl font-semibold">{current.weather}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4 text-primary" />
                      <span className="text-2xl font-bold">{current.minTemp}°</span>
                      <span className="text-muted-foreground">~</span>
                      <span className="text-2xl font-bold">{current.maxTemp}°</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">降雨機率 {current.pop}%</span>
                  </div>
                </div>
                <div className="text-primary">
                  {getWeatherIcon(current.weather)}
                </div>
              </div>
            </div>

            {/* 未來預報 */}
            <div className="grid grid-cols-3 gap-2">
              {forecast.map((day, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                >
                  <p className="text-xs text-muted-foreground mb-2">{day.time}</p>
                  <div className="text-primary mb-2 flex justify-center">
                    {getWeatherIcon(day.weather)}
                  </div>
                  <p className="text-xs text-center mb-1 truncate">{day.weather}</p>
                  <p className="text-sm font-semibold text-center">
                    {day.minTemp}° ~ {day.maxTemp}°
                  </p>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    <Droplets className="h-3 w-3 inline" /> {day.pop}%
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground">無法取得天氣資訊</p>
        )}
      </CardContent>
    </Card>
  );
};
