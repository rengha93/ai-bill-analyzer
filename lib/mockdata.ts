import { TelecomBillData } from "./schema";

export const MOCK_BILL_DATA: TelecomBillData = {
  providerDetails: {
    name: "Bharti Airtel Limited",
    gstNumber: "29AAACB2894G1ZJ"
  },
  customerInfo: {
    name: "Shri Renghanath Shanmugaraj",
    accountNumber: "20003426626",
    email: "rengha93@gmail.com",
    phone: "9791733762"
  },
  billingMetadata: {
    billNumber: "HF26291004794219",
    billDate: "12 Aug 2025",
    dueDate: "22 Aug 2025",
    billingPeriod: {
      start: "11 Jul 2025",
      end: "10 Aug 2025"
    }
  },
  planDetails: {
    planName: "999 WiFi_200Mbps",
    speed: "200 Mbps"
  },
  financialSummary: {
    previousBalance: 1178.82,
    paymentsReceived: 1178.82,
    currentCharges: {
      rental: 999.0,
      taxes: 179.82,
      otherCharges: 0.0
    },
    totalAmountDue: 1178.82
  }
};