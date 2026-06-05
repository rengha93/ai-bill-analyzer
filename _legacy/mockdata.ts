import { TelecomBillData } from "../_legacy/schema";

export const MOCK_BILL_DATA: TelecomBillData = {
  providerDetails: {
    name: "Bharti Airtel Limited",
    gstNumber: "29AAACB0000G1ZJ",
  },
  customerInfo: {
    name: "John Doe",
    accountNumber: "123456890",
    email: "john.doe@gmail.com",
    phone: "9876543210",
  },
  billingMetadata: {
    billNumber: "HF26291009876543",
    billDate: "12 Aug 2025",
    dueDate: "22 Aug 2025",
    billingPeriod: {
      start: "11 April 2026",
      end: "10 May 2026",
    },
  },
  planDetails: {
    planName: "999 WiFi_200Mbps",
    speed: "200 Mbps",
  },
  financialSummary: {
    previousBalance: 1178.82,
    paymentsReceived: 1178.82,
    currentCharges: {
      rental: 999.0,
      taxes: 179.82,
      otherCharges: 0.0,
    },
    totalAmountDue: 1178.82,
  },
};
