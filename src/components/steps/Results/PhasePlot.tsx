import Box from '@mui/material/Box';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { nontargetingData, proDeathData, antiDeathData } from '@/data/dummyData';

export default function PhasePlot() {
  return (
    <Box sx={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            type="number"
            dataKey="x"
            domain={[-6, 6]}
            tickCount={7}
            label={{
              value: 'log2 Fold Change (UNT vs T0)',
              position: 'insideBottom',
              offset: -25,
              style: { fontSize: 11, fill: '#555' },
            }}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[-6, 6]}
            tickCount={7}
            label={{
              value: 'log2 Fold Change (TRT vs UNT)',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fontSize: 11, fill: '#555' },
            }}
            tick={{ fontSize: 11 }}
          />
          <ReferenceLine x={0} stroke="#ccc" />
          <ReferenceLine y={0} stroke="#ccc" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(val) => (typeof val === 'number' ? val.toFixed(3) : val)}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />
          <Scatter
            name="Non-targeting"
            data={nontargetingData}
            fill="#777777"
            opacity={0.4}
            r={2}
          />
          <Scatter
            name="Pro-death"
            data={proDeathData}
            fill="#e53935"
            opacity={0.85}
            r={3}
          />
          <Scatter
            name="Anti-death"
            data={antiDeathData}
            fill="#1e88e5"
            opacity={0.85}
            r={3}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
}
