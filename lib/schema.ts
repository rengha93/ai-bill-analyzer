import { z } from 'zod';

export const telecomBillSchema = z.object({
  providerDetails: z.object({
    name: z.string().describe("Name of the telecom provider, e.g., Airtel"),
    gstNumber: z.string().optional().describe("GST registration number of the provider if available")
  }),
  customerInfo: z.object({
    name: z.string().describe("Name of the bill recipient"),
    accountNumber: z.string().describe("Relationship Number, Account Number, or Fixedline Number"),
    email: z.string().optional(),
    phone: z.string().optional()
  }),
  billingMetadata: z.object({
    billNumber: z.string().describe("The unique invoice or bill number"),
    billDate: z.string().describe("Date the bill was generated, e.g., 12 Aug 2025"),
    dueDate: z.string().describe("Payment due date, e.g., 22 Aug 2025"),
    billingPeriod: z.object({
      start: z.string(),
      end: z.string()
    }).describe("The period for which the bill is generated (e.g., 11 Jul 2025 to 10 Aug 2025)")
  }),
  planDetails: z.object({
    planName: z.string().describe("Name of the subscribed plan, e.g., 999 WiFi_200Mbps"),
    speed: z.string().optional().describe("Internet speed if mentioned, e.g., 200 Mbps")
  }),
  financialSummary: z.object({
    previousBalance: z.number().describe("Last bill amount or previous dues"),
    paymentsReceived: z.number().describe("Payments made against the last bill (usually a negative number or deducted)"),
    currentCharges: z.object({
      rental: z.number().describe("Base plan or rental charges before tax"),
      taxes: z.number().describe("Total GST or taxes applied"),
      otherCharges: z.number().optional().describe("Any late fees, installation fees, or other charges"),
      lineItems: z.array(z.object({
        description: z.string().describe("Description of the charge, e.g., 'Late Payment Fee' or 'One-time Activation Charge'"),
        amount: z.number()
      })).optional().describe("Itemized breakdown of individual charges beyond the base plan/rental and taxes, if listed on the bill")
    }).describe("Breakdown of just this month's specific charges"),
    totalAmountDue: z.number().describe("The final total amount payable by the due date"),
    amountAfterDueDate: z.number().optional().describe("Total amount payable if paid after the due date, including late fee, if shown on the bill")
  })
});

export type TelecomBillData = z.infer<typeof telecomBillSchema>;