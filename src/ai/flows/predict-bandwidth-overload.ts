// src/ai/flows/predict-bandwidth-overload.ts
'use server';

/**
 * @fileOverview Predicts potential bandwidth overloads based on historical usage patterns.
 *
 * - predictBandwidthOverload - Predicts potential bandwidth overloads.
 * - PredictBandwidthOverloadInput - The input type for the predictBandwidthOverload function.
 * - PredictBandwidthOverloadOutput - The return type for the predictBandwidthOverload function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictBandwidthOverloadInputSchema = z.object({
  usageData: z
    .string()
    .describe(
      'Historical bandwidth usage data in a comma separated format, with each entry representing usage at a specific time.'
    ),
  currentCapacity: z
    .number()
    .describe('The current bandwidth capacity of the network in Mbps.'),
});
export type PredictBandwidthOverloadInput = z.infer<typeof PredictBandwidthOverloadInputSchema>;

const PredictBandwidthOverloadOutputSchema = z.object({
  isOverloadLikely: z
    .boolean()
    .describe(
      'Whether a bandwidth overload is likely to occur based on the historical usage data and current capacity.'
    ),
  predictedUsage: z
    .number()
    .describe(
      'The predicted bandwidth usage at the time of the potential overload in Mbps.'
    ),
  timeOfOverload: z
    .string()
    .describe(
      'The predicted time when the bandwidth overload is likely to occur. Format must be ISO8601.'
    ),
  recommendedCapacity: z
    .number()
    .describe(
      'The recommended bandwidth capacity to avoid the predicted overload in Mbps.'
    ),
  confidenceLevel: z
    .number()
    .describe(
      'The confidence level of the prediction, ranging from 0 to 1, where 1 is the highest confidence.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the bandwidth overload prediction.'),
});
export type PredictBandwidthOverloadOutput = z.infer<typeof PredictBandwidthOverloadOutputSchema>;

export async function predictBandwidthOverload(
  input: PredictBandwidthOverloadInput
): Promise<PredictBandwidthOverloadOutput> {
  return predictBandwidthOverloadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictBandwidthOverloadPrompt',
  input: {schema: PredictBandwidthOverloadInputSchema},
  output: {schema: PredictBandwidthOverloadOutputSchema},
  prompt: `You are an expert network administrator, specializing in predicting network bandwidth overloads.

You will receive historical bandwidth usage data, the current network capacity, and you will predict whether a bandwidth overload is likely to occur.

Bandwidth Usage Data: {{{usageData}}}
Current Capacity (Mbps): {{{currentCapacity}}}

Based on this information, predict whether a bandwidth overload is likely to occur, the predicted usage at the time of the potential overload, the time of the potential overload, the recommended bandwidth capacity to avoid the overload, the confidence level of the prediction, and the reasoning behind the prediction.

Ensure that the timeOfOverload value is in ISO8601 format.
`,
});

const predictBandwidthOverloadFlow = ai.defineFlow(
  {
    name: 'predictBandwidthOverloadFlow',
    inputSchema: PredictBandwidthOverloadInputSchema,
    outputSchema: PredictBandwidthOverloadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
