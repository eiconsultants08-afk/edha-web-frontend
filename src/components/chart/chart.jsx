import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import Card from '../card/card';
import './chart.css';

export default function Chart({ data, chartColumns, chartRow, yAxisLabel, unit }) {
  // compute default hidden keys from chartColumns
  const defaultHidden = useMemo(
    () => new Set(chartColumns.filter(c => c.hidden).map(c => c.key)),
    [chartColumns]
  );

  const [hiddenKeys, setHiddenKeys] = useState(defaultHidden);

  // if chartColumns changes, re-derive defaults from it
  useEffect(() => {
    setHiddenKeys(new Set(chartColumns.filter(c => c.hidden).map(c => c.key)));
  }, [chartColumns]);

  const handleLegendClick = (o) => {
    const key = o?.dataKey;
    if (!key) return;
    setHiddenKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const legendFormatter = (value, entry) => {
    const isHidden = hiddenKeys.has(entry?.dataKey);
    return (
      <span
        style={{
          color: isHidden ? "#666" : "#000",
          fontWeight: isHidden ? 400 : 500,
          cursor: "pointer",           // show pointer on hover
          transition: "color 0.2s",    // smooth hover transition
        }}
        onMouseEnter={(e) => (e.target.style.color = isHidden ? "#444" : "#222")}
        onMouseLeave={(e) => (e.target.style.color = isHidden ? "#666" : "#000")}
      >
        {value}
      </span>
    );
  };


  return (
    <Card ctype='chart-card'>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis
            dataKey="time"
            angle={-45}
            textAnchor="end"
            interval={Math.floor(data.length / 12)}
            height={10}
            fontSize={12}
          />
          <YAxis
            domain={[0, "auto"]}
            label={{
              value: yAxisLabel || "Power (MW)",
              angle: -90,
              position: "insideLeft",
            }}
            fontSize={12}
          />
          <Tooltip
            formatter={(value, name) => [
              `${parseFloat(value).toFixed(2)} ${unit || ""}`,  // 👈 dynamic unit
              name
            ]} labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingTop: '10px', paddingRight: '30px' }}
            onClick={handleLegendClick}
            formatter={legendFormatter}
          />

          {chartColumns.map((column) => (
            <Line
              key={column.key}
              type="monotone"
              dataKey={column.key}
              name={column.label}
              stroke={column.borderColor}
              dot
              strokeWidth={2}
              connectNulls={false}
              hide={hiddenKeys.has(column.key)}   // <-- visibility controlled from chartColumns + legend
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
