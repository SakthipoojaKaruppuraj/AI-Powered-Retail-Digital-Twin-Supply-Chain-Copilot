import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, CloudSun, Calendar, Percent, ShieldCheck } from 'lucide-react';

export default function DemandForecast({ demandHistory = {}, products = [] }) {
  const [selectedItem, setSelectedItem] = useState('Milk');
  const [weather, setWeather] = useState('sunny'); // sunny, rain
  const [festival, setFestival] = useState('none'); // none, active
  const [promo, setPromo] = useState('none'); // none, active

  const items = Object.keys(demandHistory).length > 0
    ? Object.keys(demandHistory)
    : ['Milk', 'Cheese', 'Rice', 'Wheat', 'Laptops', 'Phones'];

  // Base forecasts and multipliers
  const getMultiplier = () => {
    let mult = 1.0;
    if (weather === 'rain' && selectedItem === 'Milk') mult += 0.25;
    if (weather === 'rain' && selectedItem === 'Laptops') mult -= 0.15;
    if (festival === 'active') mult += 0.50;
    if (promo === 'active') mult += 0.40;
    return mult;
  };

  const multiplier = getMultiplier();

  // Generate chart data using backend demandHistory or fallback
  const generateData = () => {
    const historicalBase = {
      Milk: [120, 115, 130, 125, 140, 155, 150],
      Cheese: [45, 48, 42, 50, 52, 60, 58],
      Rice: [280, 290, 310, 305, 320, 340, 330],
      Wheat: [190, 200, 185, 210, 220, 235, 225],
      Laptops: [12, 10, 15, 14, 16, 18, 17],
      Phones: [38, 35, 42, 40, 48, 55, 50]
    };

    const forecastBase = {
      Milk: [160, 165, 180, 200, 210, 230, 250],
      Cheese: [62, 65, 70, 75, 82, 85, 90],
      Rice: [340, 355, 370, 390, 410, 430, 450],
      Wheat: [230, 240, 255, 270, 290, 310, 330],
      Laptops: [19, 21, 23, 25, 28, 30, 32],
      Phones: [52, 58, 62, 68, 74, 80, 85]
    };

    const itemHistory = demandHistory[selectedItem]?.historicalSales || historicalBase[selectedItem] || [100, 110, 105, 120, 125, 130, 135];
    const itemForecast = demandHistory[selectedItem]?.forecastSales || forecastBase[selectedItem] || [140, 145, 150, 160, 170, 180, 190];
    const days = demandHistory[selectedItem]?.dates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const data = [];

    // History (last 7 days)
    days.forEach((day, index) => {
      data.push({
        name: day,
        sales: itemHistory[index] || 0,
        forecast: null,
      });
    });

    // Forecast (next 7 days)
    days.forEach((day, index) => {
      const baseVal = itemForecast[index] || 100;
      const forecastedVal = Math.round(baseVal * multiplier);
      
      // Hook Sunday (day index 6) of history to Monday forecast to make a continuous line
      if (index === 0 && data.length > 6) {
        data[6].forecast = data[6].sales;
      }

      data.push({
        name: `Next ${day}`,
        sales: null,
        forecast: forecastedVal
      });
    });

    return data;
  };

  const chartData = generateData();

  // Recommendation builder
  const getRecommendation = () => {
    const totalPredictedDemand = chartData
      .filter(d => d.forecast !== null)
      .reduce((sum, d) => sum + d.forecast, 0);

    const targetProduct = products.find(p => p.name.toLowerCase() === selectedItem.toLowerCase());
    const unitPrice = targetProduct?.unitPrice || { Milk: 60, Cheese: 120, Rice: 80, Wheat: 70, Laptops: 45000, Phones: 25000 }[selectedItem] || 100;

    const baseOrder = { Milk: 200, Cheese: 80, Rice: 400, Wheat: 300, Laptops: 25, Phones: 70 }[selectedItem] || 150;
    const orderQuantity = Math.round(baseOrder * multiplier);

    return {
      total: totalPredictedDemand,
      order: orderQuantity,
      impact: Math.round(orderQuantity * unitPrice * 0.15)
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723]">Demand Forecasting</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">7-day historical sales vs predicted AI models (Prophet/LSTM)</p>
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

      {/* modifier settings */}
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
              name="AI Predictive Demand"
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
          <div className="text-xs font-bold text-[#2a3723]">AI Supply Chain Recommendation</div>
          <p className="text-[11px] text-[#2a3723]/80 mt-1 font-medium leading-relaxed">
            Total expected demand for next week is <span className="font-bold text-[#2a3723] font-mono">{recommendation.total}</span> units. 
            We recommend creating a Purchase Order of <span className="font-bold text-[#2a3723] font-mono">{recommendation.order} {selectedItem}</span> today.
          </p>
          <div className="text-[10px] text-[#2a3723] font-bold mt-1">
            Expected Revenue Impact: ~₹{recommendation.impact.toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}
