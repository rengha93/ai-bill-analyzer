import { TelecomBillData } from "@/lib/schema";

interface BillDashboardProps {
  data: TelecomBillData;
}

export default function BillDashboard({ data }: BillDashboardProps) {
  return (
    <div className="w-full flex flex-col gap-6 text-left mt-4">
      {/* HEADER: Hero Amount & Due Date */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
            Total Amount Due
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            ₹{data.financialSummary.totalAmountDue.toFixed(2)}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
            Due Date
          </p>
          <p className="text-xl font-semibold text-red-600">
            {data.billingMetadata.dueDate}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Customer & Plan Details */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Account Details</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500 inline-block w-24">Provider:</span> <span className="font-semibold uppercase">{data.providerDetails.name}</span></p>
              <p><span className="text-slate-500 inline-block w-24">Name:</span> <span className="font-medium">{data.customerInfo.name}</span></p>
              <p><span className="text-slate-500 inline-block w-24">Account No:</span> <span className="font-mono text-slate-700">{data.customerInfo.accountNumber}</span></p>
              <p><span className="text-slate-500 inline-block w-24">Bill Period:</span> <span className="font-medium">{data.billingMetadata.billingPeriod.start} to {data.billingMetadata.billingPeriod.end}</span></p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Plan Information</h3>
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500 inline-block w-24">Plan:</span> <span className="font-medium">{data.planDetails.planName}</span></p>
              {data.planDetails.speed && (
                <p><span className="text-slate-500 inline-block w-24">Speed:</span> <span className="font-medium">{data.planDetails.speed}</span></p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Financial Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Charge Breakdown</h3>
          
          <div className="space-y-4 text-sm">
            {/* Current Month */}
            <div>
              <p className="font-semibold text-slate-700 mb-2">This Month's Charges</p>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Base Rental</span>
                <span>₹{data.financialSummary.currentCharges.rental.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Taxes (GST)</span>
                <span>₹{data.financialSummary.currentCharges.taxes.toFixed(2)}</span>
              </div>
              {data.financialSummary.currentCharges.otherCharges !== undefined && data.financialSummary.currentCharges.otherCharges > 0 && (
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Other Charges</span>
                  <span>₹{data.financialSummary.currentCharges.otherCharges.toFixed(2)}</span>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* History */}
            <div>
              <p className="font-semibold text-slate-700 mb-2">Previous Statement</p>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Previous Balance</span>
                <span>₹{data.financialSummary.previousBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600 mb-1">
                <span>Payments Received</span>
                <span>{data.financialSummary.paymentsReceived < 0 ? '' : '-'}₹{Math.abs(data.financialSummary.paymentsReceived).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}