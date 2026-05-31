'use server';

import { google } from '@ai-sdk/google';
import { generateText, Output } from 'ai'; 
import { telecomBillSchema } from '@/lib/schema';

export async function analyzeBillAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { output } = await generateText({
      model: google('gemini-2.5-flash'),
      output: Output.object({ schema: telecomBillSchema }),
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: 'Carefully analyze this telecom bill. Extract the provider details, account number, due date, breakdown of line items, and the total amount due.' 
            },
            { 
              type: 'file', 
              data: buffer, 
              mediaType: file.type 
            }
          ]
        }
      ]
    });

    return { success: true, data: output }; 
    
  } catch (error) {
    console.error("Extraction failed:", error);
    return { success: false, error: "Failed to parse the bill." };
  }
}