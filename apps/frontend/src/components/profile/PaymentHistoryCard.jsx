import React from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PaymentHistoryCard = () => {
  const { payments } = useApp();

  return (
    <div className="rounded-2xl border transition-all duration-200 dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 md:p-6 border-b dark:border-[#222222] border-[#eaeaea] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-500" />
          <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
            Billing & Payment Transactions
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-200 font-semibold dark:text-neutral-300 text-neutral-800">
            {payments.length} {payments.length === 1 ? 'order' : 'orders'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Razorpay Verified</span>
        </div>
      </div>

      {/* Content */}
      {payments.length === 0 ? (
        <div className="py-12 px-6 text-center flex flex-col items-center justify-center space-y-2">
          <CreditCard className="w-8 h-8 text-neutral-500" />
          <h3 className="text-sm font-bold dark:text-white text-black">
            No Billing Transactions Recorded
          </h3>
          <p className="text-xs dark:text-neutral-400 text-neutral-500">
            All Razorpay payment receipts, checkout orders, and automated invoices will be permanently recorded here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#111111] bg-neutral-50 border-b dark:border-[#222222] border-[#eaeaea] text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500">
              <tr>
                <th className="py-3 px-5 font-semibold">Order Reference</th>
                <th className="py-3 px-5 font-semibold">Product & Plan</th>
                <th className="py-3 px-5 font-semibold">Amount</th>
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#1a1a1a] divide-neutral-100 font-sans">
              {payments.map((p) => {
                const isPaid = p.status === 'paid';
                const isPending = p.status === 'pending';

                return (
                  <tr
                    key={p.id}
                    className="hover:dark:bg-[#111111]/60 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-mono text-[11px]">
                      <div className="font-bold dark:text-white text-black select-all">
                        {p.orderReference}
                      </div>
                      {p.razorpayOrderId && (
                        <div className="text-[10px] text-neutral-500 font-mono">
                          ID: {p.razorpayOrderId}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-semibold dark:text-white text-black">
                        {p.productName}
                      </div>
                      <div className="text-[11px] text-purple-400 font-mono">
                        {p.planName}
                      </div>
                    </td>

                    <td className="py-3.5 px-5 font-mono font-semibold dark:text-white text-black">
                      ₹{p.amountFormatted} {p.currency}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isPending
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Paid</span>
                          </>
                        ) : isPending ? (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-[11px] font-mono dark:text-neutral-400 text-neutral-600">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryCard;
