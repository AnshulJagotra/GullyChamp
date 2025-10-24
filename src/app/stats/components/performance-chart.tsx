'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Line, LineChart, TooltipProps } from 'recharts';
import { BattingMatch, BowlingMatch } from '@/lib/types';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformanceChartProps {
  battingData: BattingMatch[];
  bowlingData: BowlingMatch[];
}

const chartConfigBatting = {
  runs: {
    label: 'Runs',
    color: 'hsl(var(--chart-1))',
  },
};

const chartConfigBowling = {
  wickets: {
    label: 'Wickets',
    color: 'hsl(var(--chart-2))',
  },
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 text-xs bg-background border rounded-md shadow-lg">
        <p className="font-bold">{format(new Date(label), "MMM d")}</p>
        <p style={{ color: payload[0].color }}>{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function PerformanceChart({ battingData, bowlingData }: PerformanceChartProps) {
  const formattedBattingData = battingData.map(m => ({ date: m.date, runs: m.runs })).reverse();
  const formattedBowlingData = bowlingData.map(m => ({ date: m.date, wickets: m.wickets })).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>Your performance over your last matches.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="batting">
          <TabsList>
            <TabsTrigger value="batting" disabled={battingData.length === 0}>Batting</TabsTrigger>
            <TabsTrigger value="bowling" disabled={bowlingData.length === 0}>Bowling</TabsTrigger>
          </TabsList>
          <TabsContent value="batting">
            <ChartContainer config={chartConfigBatting} className="h-[250px] w-full">
              <LineChart data={formattedBattingData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis />
                <ChartTooltip content={<CustomTooltip />} />
                <Line dataKey="runs" type="monotone" stroke="var(--color-runs)" strokeWidth={2} dot={true} />
              </LineChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="bowling">
            <ChartContainer config={chartConfigBowling} className="h-[250px] w-full">
               <BarChart data={formattedBowlingData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<CustomTooltip />} />
                <Bar dataKey="wickets" fill="var(--color-wickets)" radius={4} />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
