import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, CloudSun, Calendar, Percent, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function DemandForecast({ demandHistory = {}, products = [] }) {
  const [selectedItem, setSelectedItem] = useState('Milk');
  const [weather, setWeather] = useState('sunny'); // sunny, rain
  const [festival, setFestival] = useState('none'); // none, active
  const [promo, setPromo] = useState('none'); // none, active

  const [forecastData, setForecastData] = useState(null);

  const items = Object.keys(demandHistory).length > 0
    ? Object.keys(demandHistory)
    : ['Milk', 'Cheese', 'Rice', 'Wheat', 'Laptops', 'Phones'];

  // Fetch backend-calculated forecast intelligence from REST API
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const data = await api.getDemandForecast(selectedItem, { weather, festival, promo });
        if (data && data.products && data.products.length > 0) {
          setForecastData(data.products[0]);
        }
      } catch (err) {
        console.error('Failed to fetch demand forecast from backend REST API:', err);
      }
    };
    fetchForecast();
  }, [selectedItem, weather, festival, promo]);

  // Format Recharts dataset from backend forecast data
  const generateChartData = () => {
    if (!forecastData) return [];

    const historicalSales = forecastData.historicalSales || [120, 115, 130, 125, 140, 155, 150];
    const historicalDates = forecastData.historicalDates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const forecastVector = forecastData.forecast || [];

    const data = [];

    // History (last 7 days)
    historicalDates.forEach((day, index) => {
      data.push({
        name: day,
        sales: historicalSales[index] !== undefined ? historicalSales[index] : 0,
        forecast: null,
      });
    });

    // Forecast (next 7 days)
    forecastVector.forEach((f, index) => {
      if (index === 0 && data.length > 0) {
        data[data.length - 1].forecast = data[data.length - 1].sales;
      }
      data.push({
        name: f.name,
        sales: null,
        forecast: f.predictedDemand
      });
    });

    return data;
  };

  const chartData = generateChartData();

  const totalPredictedDemand = forecastData?.totalWeeklyPredictedDemand || 0;
  const recommendedOrder = forecastData?.recommendedReorderQty || 0;
  const expectedImpact = forecastData?.expectedRevenueImpact || 0;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723]">Demand Forecasting</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Deterministic 7-day Weighted Moving Average & Stockout Intelligence</p>
        </div>

        {/* Item Selector */}
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
          className="bg-white border border-[#b9bba8] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#2a3723] font-bold text-[#2a3723]"
        >
          {items.map(item => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {/* Modifier Settings */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className={`p-3 rounded-xl border transition-all ${
          weather === 'rain' 
            ? 'bg-[#2a3723]/10 border-[#2a3723]/40 text-[#2a3723]' 
            : 'bg-[#dcd9cf]/20 border-[#b9bba8]/30 text-[#2a3723]/70 hover:bg-[#dcd9cf]/40'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-bold mb-2">
            <CloudSun className="w-3.5 h-3.5 text-[#2a3723]" />
            Weather Factor
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWeather('sunny')}
              className={`flex-1 text-[10px] py-1 rounded cursor-pointer font-bold ${weather === 'sunny' ? 'bg-[#2a3723] text-white shadow-sm' : 'bg-[#dcd9cf]/60 hover:bg-[#dcd9cf]/90 text-[#2a3723]'}`}
            >
              Sunny
            </button>
            <button
              onClick={() => setWeather('rain')}
              className={`flex-1 text-[10px] py-1 rounded cursor-pointer font-bold ${weather === 'rain' ? 'bg-[#2a3723] text-white shadow-sm' : 'bg-[#dcd9cf]/60 hover:bg-[#dcd9cf]/90 text-[#2a3723]'}`}
            >
              Rainy
            </button>
          </div>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${
          festival === 'active' 
            ? 'bg-[#2a3723]/10 border-[#2a3723]/40 text-[#2a3723]' 
            : 'bg-[#dcd9cf]/20 border-[#b9bba8]/30 text-[#2a3723]/70 hover:bg-[#dcd9cf]/40'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#2a3723]" />
            Holidays/Festivals
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFestival('none')}
              className={`flex-1 text-[10px] py-1 rounded cursor-pointer font-bold ${festival === 'none' ? 'bg-[#2a3723] text-white shadow-sm' : 'bg-[#dcd9cf]/60 hover:bg-[#dcd9cf]/90 text-[#2a3723]'}`}
            >
              None
            </button>
            <button
              onClick={() => setFestival('active')}
              className={`flex-1 text-[10px] py-1 rounded cursor-pointer font-bold ${festival === 'active' ? 'bg-[#2a3723] text-white shadow-sm' : 'bg-[#dcd9cf]/60 hover:bg-[#dcd9cf]/90 text-[#2a3723]'}`}
            >
              Festival
            </button>
          </div>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${
          promo === 'active' 
            ? 'bg-[#2a3723]/10 border-[#2a3723]/40 text-[#2a3723]' 
            : 'bg-[#dcd9cf]/20 border-[#b9bba8]/30 text-[#2a3723]/70 hover:bg-[#dcd9cf]/40'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-bold mb-2">
            <Percent className="w-3.5 h-3.5 text-[#2a3723]" />
            Promo Discount
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPromo('none')}
              className={`flex-1 text-[10px] py-1 rounded cursor-pointer font-bold ${promo === 'none' ? 'bg-[#2a3723] text-white shadow-sm' : 'bg-[#dcd9cf]/60 hover:bg-[#dcd9cf]/90 text-[#2a3723]'}`}
            >
              Off
            </button>
            <button
              onClick={() => setPromo('active')}
              className={`flex-1 text-[10px] py-1 rounded cursor-pointer font-bold ${promo === 'active' ? 'bg-[#2a3723] text-white shadow-sm' : 'bg-[#dcd9cf]/60 hover:bg-[#dcd9cf]/90 text-[#2a3723]'}`}
            >
              Active
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2a3723" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#2a3723" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5a6e50" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#5a6e50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#b9bba8" opacity={0.4} />
            <XAxis dataKey="name" stroke="#2a3723" fontSize={10} tickLine={false} />
            <YAxis stroke="#2a3723" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#e8e5dd', border: '1px solid #b9bba8', borderRadius: '8px', color: '#2a3723' }}
              labelStyle={{ color: '#2a3723', fontWeight: 'bold', fontSize: '11px' }}
              itemStyle={{ fontSize: '11px', color: '#2a3723' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#2a3723' }} />
            <Area
              name="Historical Sales"
              type="monotone"
              dataKey="sales"
              stroke="#2a3723"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              connectNulls
            />
            <Area
              name="Deterministic Forecast"
              type="monotone"
              dataKey="forecast"
              stroke="#5a6e50"
              strokeDasharray="4 4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorForecast)"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Recommendations */}
      <div className="mt-4 p-4 rounded-xl bg-[#2a3723]/5 border border-[#2a3723]/10 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2a3723] shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-[#2a3723] flex items-center gap-2">
            AI Supply Chain Recommendation
            {forecastData && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                forecastData.stockoutRisk === 'CRITICAL' ? 'bg-red-200 text-red-900' :
                forecastData.stockoutRisk === 'HIGH' ? 'bg-amber-200 text-amber-900' :
                'bg-green-200 text-green-900'
              }`}>
                RISK: {forecastData.stockoutRisk} ({forecastData.daysOfSupply !== null ? `${forecastData.daysOfSupply} Days` : 'N/A'})
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#2a3723]/80 mt-1 font-medium leading-relaxed">
            Total expected demand for next week is <span className="font-bold text-[#2a3723] font-mono">{totalPredictedDemand}</span> units. 
            We recommend creating a Purchase Order of <span className="font-bold text-[#2a3723] font-mono">{recommendedOrder} {selectedItem}</span> today (Cap Limit: {forecastData?.capacity || 120}).
          </p>
          <div className="text-[10px] text-[#2a3723] font-bold mt-1">
            Expected Revenue Impact: ~₹{expectedImpact.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}
