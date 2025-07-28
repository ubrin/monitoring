'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPrediction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Bot, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { PredictBandwidthOverloadOutput } from '@/ai/flows/predict-bandwidth-overload';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  usageData: z.string().min(1, 'Usage data is required.'),
  currentCapacity: z.coerce.number().min(1, 'Capacity must be greater than 0.'),
});

const sampleUsageData = "150,180,200,220,250,300,350,400,420,450,480,500,510,490,480,550,600,620,700,800,850,900,920,950,980";

export default function PredictionCard() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [prediction, setPrediction] = React.useState<PredictBandwidthOverloadOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usageData: sampleUsageData,
      currentCapacity: 1000,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await getPrediction(values);
      setPrediction(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-primary" />
            <CardTitle className="font-headline">Predictive Alerts</CardTitle>
        </div>
        <CardDescription>
          AI-powered tool to predict potential bandwidth overload based on usage patterns.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="usageData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Usage Data (CSV)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., 150,180,200..." {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Capacity (Mbps)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Predict Overload'
              )}
            </Button>
            {prediction && (
              <Card className="w-full bg-background/50">
                  <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                          {prediction.isOverloadLikely ? <AlertTriangle className="text-destructive"/> : <ShieldCheck className="text-green-500" />}
                          Prediction Result
                      </CardTitle>
                  </CardHeader>
                <CardContent className="text-sm space-y-2">
                   <div className="flex justify-between items-center">
                       <span>Overload Likely:</span>
                       <Badge variant={prediction.isOverloadLikely ? "destructive" : "secondary"}>{prediction.isOverloadLikely ? 'Yes' : 'No'}</Badge>
                   </div>
                   <div className="flex justify-between items-center">
                       <span>Confidence:</span>
                       <span>{(prediction.confidenceLevel * 100).toFixed(0)}%</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <span>Predicted Peak Usage:</span>
                       <span>{prediction.predictedUsage} Mbps</span>
                   </div>
                   <div className="flex justify-between items-center">
                       <span>Recommended Capacity:</span>
                       <span>{prediction.recommendedCapacity} Mbps</span>
                   </div>
                   <p className="text-muted-foreground pt-2 text-xs">{prediction.reasoning}</p>
                </CardContent>
              </Card>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
