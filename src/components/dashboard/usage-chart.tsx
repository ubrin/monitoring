'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import type { Customer } from '@/lib/data';

const chartConfig = {
  download: {
    label: 'Download',
    color: 'hsl(var(--primary))',
  },
  upload: {
    label: 'Upload',
    color: 'hsl(var(--accent))',
  },
} satisfies ChartConfig;

export default function UsageChart({ customer }: { customer: Customer | null }) {
  const chartData = customer
    ? [
        {
          metric: 'Usage',
          download: customer.download,
          upload: customer.upload,
        },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Bandwidth Usage</CardTitle>
        <CardDescription>
          {customer
            ? `Upload/Download for ${customer.username}`
            : 'Select a customer to view their usage'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {customer ? (
          <ChartContainer config={chartConfig} className="h-[150px] w-full">
            <BarChart accessibilityLayer data={chartData} layout="vertical">
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="metric"
                type="category"
                tickLine={false}
                axisLine={false}
                hide
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="download" fill="var(--color-download)" radius={4} />
              <Bar dataKey="upload" fill="var(--color-upload)" radius={4} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-[150px] flex items-center justify-center text-sm text-muted-foreground">
            No customer selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}
