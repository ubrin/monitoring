'use server';

import { 
  predictBandwidthOverload, 
  type PredictBandwidthOverloadInput, 
  type PredictBandwidthOverloadOutput 
} from "@/ai/flows/predict-bandwidth-overload";
import { z } from 'zod';

const PredictBandwidthOverloadInputSchema = z.object({
  usageData: z.string(),
  currentCapacity: z.number(),
});


export async function getPrediction(input: PredictBandwidthOverloadInput): Promise<PredictBandwidthOverloadOutput> {
  const validatedInput = PredictBandwidthOverloadInputSchema.safeParse(input);

  if (!validatedInput.success) {
      throw new Error("Invalid input provided for prediction.");
  }
  
  try {
    const result = await predictBandwidthOverload(validatedInput.data);
    return result;
  } catch (error) {
    console.error("Error getting prediction:", error);
    // In a real app, you might want to log this error to a monitoring service
    throw new Error("Failed to get prediction from the AI model. Please try again later.");
  }
}
