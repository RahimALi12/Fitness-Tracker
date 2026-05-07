// import React from 'react';
// import './NutritionChart.css';

// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   BarChart, Bar, PieChart, Pie, Cell
// } from 'recharts';

// const NutritionChart = ({ data }) => {
//   // Process data for charts
//   const chartData = data.map(log => {
//     const totalCalories = log.foodItems.reduce((total, item) => total + (item.calories || 0), 0);
//     const totalMacros = log.foodItems.reduce(
//       (totals, item) => ({
//         protein: totals.protein + (item.macros?.protein || 0),
//         carbs: totals.carbs + (item.macros?.carbs || 0),
//         fat: totals.fat + (item.macros?.fat || 0)
//       }),
//       { protein: 0, carbs: 0, fat: 0 }
//     );

//     return {
//       date: new Date(log.date).toLocaleDateString(),
//       calories: totalCalories,
//       protein: totalMacros.protein,
//       carbs: totalMacros.carbs,
//       fat: totalMacros.fat,
//       mealType: log.mealType
//     };
//   });

//   // Calculate average macros for pie chart
//   const avgMacros = chartData.reduce(
//     (totals, entry) => ({
//       protein: totals.protein + entry.protein,
//       carbs: totals.carbs + entry.carbs,
//       fat: totals.fat + entry.fat
//     }),
//     { protein: 0, carbs: 0, fat: 0 }
//   );

//   if (chartData.length > 0) {
//     avgMacros.protein = avgMacros.protein / chartData.length;
//     avgMacros.carbs = avgMacros.carbs / chartData.length;
//     avgMacros.fat = avgMacros.fat / chartData.length;
//   }

//   const pieData = [
//     { name: 'Protein', value: avgMacros.protein, color: '#3498db' },
//     { name: 'Carbs', value: avgMacros.carbs, color: '#27ae60' },
//     { name: 'Fat', value: avgMacros.fat, color: '#e67e22' }
//   ];

//   // Calories by meal type
//   const mealTypeData = chartData.reduce((acc, entry) => {
//     const existing = acc.find(item => item.mealType === entry.mealType);
//     if (existing) {
//       existing.calories += entry.calories;
//       existing.count += 1;
//     } else {
//       acc.push({ 
//         mealType: entry.mealType, 
//         calories: entry.calories, 
//         count: 1 
//       });
//     }
//     return acc;
//   }, []).map(item => ({
//     ...item,
//     avgCalories: Math.round(item.calories / item.count)
//   }));

//   // Custom Tooltip Component
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="chart-tooltip">
//           <div className="tooltip-header">{label}</div>
//           {payload.map((entry, index) => (
//             <div key={index} className="tooltip-row">
//               <span className="tooltip-label">{entry.dataKey}:</span>
//               <span className="tooltip-value">{entry.value}</span>
//             </div>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   if (!data || data.length === 0) {
//     return (
//       <div className="nutrition-container">
//         <div className="no-data-message">
//           <div className="no-data-icon">📊</div>
//           <h3>No Nutrition Data Available</h3>
//           <p>Start tracking your nutrition to see analytics!</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="nutrition-container">
//       {/* Header */}
//       <div className="stats-header">
//         <h2 className="nutrition-title">Nutrition Analytics</h2>
//       </div>

//       {/* Charts Grid */}
//       <div className="charts-grid">
//         {/* Daily Calories Chart */}
//         <div className="chart-section">
//           <div className="chart-box">
//             <div className="chart-header">
//               <h3 className="chart-heading">Daily Calories Intake</h3>
//               <p className="chart-description">Track your daily calorie consumption</p>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
//                 <XAxis 
//                   dataKey="date" 
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12, fill: '#7f8c8d' }}
//                 />
//                 <YAxis 
//                   label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12, fill: '#7f8c8d' }}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="calories" 
//                   stroke="#e74c3c" 
//                   strokeWidth={3} 
//                   dot={{ fill: '#e74c3c', strokeWidth: 2, r: 5 }}
//                   activeDot={{ r: 7, stroke: '#e74c3c', strokeWidth: 2, fill: '#fff' }}
//                   name="Calories"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Macronutrients Over Time */}
//         <div className="chart-section">
//           <div className="chart-box">
//             <div className="chart-header">
//               <h3 className="chart-heading">Macronutrients Over Time</h3>
//               <p className="chart-description">Monitor your protein, carbs, and fat intake</p>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
//                 <XAxis 
//                   dataKey="date" 
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12, fill: '#7f8c8d' }}
//                 />
//                 <YAxis 
//                   label={{ value: 'Grams', angle: -90, position: 'insideLeft' }}
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12, fill: '#7f8c8d' }}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="protein" 
//                   stroke="#3498db" 
//                   strokeWidth={3}
//                   dot={{ fill: '#3498db', strokeWidth: 2, r: 4 }}
//                   name="Protein (g)"
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="carbs" 
//                   stroke="#27ae60" 
//                   strokeWidth={3}
//                   dot={{ fill: '#27ae60', strokeWidth: 2, r: 4 }}
//                   name="Carbs (g)"
//                 />
//                 <Line 
//                   type="monotone" 
//                   dataKey="fat" 
//                   stroke="#e67e22" 
//                   strokeWidth={3}
//                   dot={{ fill: '#e67e22', strokeWidth: 2, r: 4 }}
//                   name="Fat (g)"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Average Macronutrient Distribution */}
//         <div className="chart-section">
//           <div className="chart-box">
//             <div className="chart-header">
//               <h3 className="chart-heading">Average Macronutrient Distribution</h3>
//               <p className="chart-description">Your average macro breakdown</p>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => [`${value.toFixed(1)}g`, '']} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Calories by Meal Type */}
//         <div className="chart-section">
//           <div className="chart-box">
//             <div className="chart-header">
//               <h3 className="chart-heading">Average Calories by Meal Type</h3>
//               <p className="chart-description">Breakdown of calories by meal</p>
//             </div>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={mealTypeData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
//                 <XAxis 
//                   dataKey="mealType" 
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12, fill: '#7f8c8d' }}
//                 />
//                 <YAxis 
//                   label={{ value: 'Avg Calories', angle: -90, position: 'insideLeft' }}
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 12, fill: '#7f8c8d' }}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend />
//                 <Bar 
//                   dataKey="avgCalories" 
//                   fill="#9b59b6"
//                   name="Average Calories"
//                   radius={[4, 4, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NutritionChart;










import React from 'react';
import './NutritionChart.css';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const NutritionChart = ({ data }) => {
  // Prepare data with calories, macros, mealType, foodItems
  const chartData = data.map(log => {
    const totalCalories = log.foodItems.reduce((t, item) => t + (item.calories || 0), 0);
    const totalMacros = log.foodItems.reduce((totals, item) => ({
      protein: totals.protein + (item.macros?.protein || 0),
      carbs: totals.carbs + (item.macros?.carbs || 0),
      fat: totals.fat + (item.macros?.fat || 0)
    }), { protein:0, carbs:0, fat:0 });

    return {
      date: new Date(log.date).toLocaleDateString(),
      calories: totalCalories,
      protein: totalMacros.protein,
      carbs: totalMacros.carbs,
      fat: totalMacros.fat,
      mealType: log.mealType,
      foodItems: log.foodItems
    };
  });

  const totalDays = chartData.length;
  const totalCaloriesAllTime = chartData.reduce((sum, entry) => sum + entry.calories, 0);

  const avgMacros = chartData.reduce((totals, entry) => ({
    protein: totals.protein + entry.protein,
    carbs: totals.carbs + entry.carbs,
    fat: totals.fat + entry.fat
  }), { protein:0, carbs:0, fat:0 });

  const pieData = [
    { name: 'Protein', value: (avgMacros.protein / totalDays) || 0, color: '#3498db' },
    { name: 'Carbs', value: (avgMacros.carbs / totalDays) || 0, color: '#27ae60' },
    { name: 'Fat', value: (avgMacros.fat / totalDays) || 0, color: '#e67e22' }
  ];

  const mealTypeData = chartData.reduce((acc, entry) => {
    const found = acc.find(item => item.mealType === entry.mealType);
    if (found) { found.calories += entry.calories; found.count++; }
    else { acc.push({ mealType: entry.mealType, calories: entry.calories, count:1 }); }
    return acc;
  }, []).map(item => ({
    ...item,
    avgCalories: Math.round(item.calories / item.count)
  }));

  // Favorite foods: top 5 by frequency
  const freq = {};
  chartData.forEach(entry =>
    entry.foodItems.forEach(item => {
      const name = item.name;
      freq[name] = (freq[name] || 0) + 1;
    })
  );
  const favoriteFoods = Object.entries(freq)
    .map(([name,count]) => ({ name, count }))
    .sort((a,b) => b.count - a.count)
    .slice(0,5);

  const CustomTooltip = ({ active, payload, label }) => (
    active && payload && (
      <div className="chart-tooltip">
        <div className="tooltip-header">{label}</div>
        {payload.map((entry,i) => (
          <div key={i} className="tooltip-row">
            <span className="tooltip-label">{entry.dataKey}:</span>
            <span className="tooltip-value">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  );

  if (!data || data.length === 0) {
    return (
      <div className="nutrition-container">
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <h3>No Nutrition Data Available</h3>
          <p>Start tracking your nutrition to see analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrition-container">
         <div className="stats-header">
     <h2 className="nutrition-title">Nutrition Analytics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalDays}</div>
            <div className="stat-label">Total Days</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalCaloriesAllTime}</div>
            <div className="stat-label">Total Calories</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{favoriteFoods[0]?.name || 'N/A'}</div>
            <div className="stat-label">Top Food</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
      <div className="chart-box">
            <div className="chart-header">
              <h3 className="chart-heading">Daily Calories Intake</h3>
              <p className="chart-description">Track your daily calorie consumption</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <YAxis 
                  label={{ value: 'Calories', angle: -90, position: 'insideLeft' }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="#e74c3c" 
                  strokeWidth={3} 
                  dot={{ fill: '#e74c3c', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#e74c3c', strokeWidth: 2, fill: '#fff' }}
                  name="Calories"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
    

        {/* Average Macronutrient Pie Chart */}
        <div className="chart-section">
       <div className="chart-box">
            <div className="chart-header">
              <h3 className="chart-heading">Average Macronutrient Distribution</h3>
              <p className="chart-description">Your average macro breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toFixed(1)}g`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Calories by MealType Bar Chart */}
        <div className="chart-section">
   <div className="chart-box">
            <div className="chart-header">
              <h3 className="chart-heading">Average Calories by Meal Type</h3>
              <p className="chart-description">Breakdown of calories by meal</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mealTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis 
                  dataKey="mealType" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <YAxis 
                  label={{ value: 'Avg Calories', angle: -90, position: 'insideLeft' }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="avgCalories" 
                  fill="#9b59b6"
                  name="Average Calories"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Newly Added Favorite Foods Bar Chart */}
        <div className="chart-section">
          <div className="chart-box">
            <div className="chart-header">
              <h3 className="chart-heading">Most Frequently Consumed Foods</h3>
              <p className="chart-description">Your top 5 items</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={favoriteFoods}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1"/>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7f8c8d'}}/>
                <YAxis tick={{ fontSize: 12, fill: '#7f8c8d'}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="count" fill="#f39c12" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionChart;

