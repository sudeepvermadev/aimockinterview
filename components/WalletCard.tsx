"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  ExternalLink,
  Coins,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { getTransactionHistory } from "@/lib/actions/payment.action";
import { exportTransactionsToExcel } from "@/lib/utils/export";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

interface WalletCardProps {
  user: any;
}

export default function WalletCard({ user }: WalletCardProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.id) return;
      const result = await getTransactionHistory(user.id);
      if (result.success) {
        setTransactions(result.transactions || []);
      }
      setLoading(false);
    }
    fetchHistory();
  }, [user?.id]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpired = user?.planExpiresAt ? new Date(user.planExpiresAt) < new Date() : true;

  return (
    <div className="space-y-6">
      {/* Balance & Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet Balance Card */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2rem] p-6 hover:border-blue-500/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Wallet className="w-6 h-6" />
             </div>
             <Link href="/pricing" className="text-xs font-black text-blue-400 uppercase tracking-widest hover:underline flex items-center gap-1">
                Add Coins <ArrowUpRight className="w-3 h-3" />
             </Link>
          </div>
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">PrepCoins Balance</p>
          <div className="flex items-center gap-2">
             <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{user?.walletBalance || 0}</h3>
             <Coins className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2rem] p-6 hover:border-purple-500/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                <ShieldCheck className="w-6 h-6" />
             </div>
             {user?.isPro && !isExpired ? (
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20">
                   Active
                </span>
             ) : (
                <span className="px-2.5 py-1 bg-slate-500/10 text-[var(--text-secondary)] text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                   Inactive
                </span>
             )}
          </div>
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">Current Plan</p>
          <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">
             {user?.plan || "Free Tier"}
          </h3>
          {user?.planExpiresAt && !isExpired && (
             <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Expires: {formatDate(user.planExpiresAt)}
             </p>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-500/10 rounded-2xl">
                <History className="w-6 h-6 text-[var(--text-secondary)]" />
             </div>
             <div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">Transaction History</h3>
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Your recent recharges & subs</p>
             </div>
          </div>
          {transactions.length > 0 && (
             <button 
                onClick={() => exportTransactionsToExcel(transactions, user.name || "User")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
             >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
             </button>
          )}
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {loading ? (
             <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                <Clock className="w-8 h-8 text-[var(--text-muted)] animate-spin" />
                <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">Fetching History...</p>
             </div>
          ) : transactions.length > 0 ? (
             transactions.map((txn) => (
                <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                         txn.type === "recharge" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : txn.type === "usage"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      }`}>
                         {txn.type === "recharge" ? <ArrowDownLeft className="w-6 h-6" /> : txn.type === "usage" ? <Coins className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div>
                         <p className="font-black text-[var(--text-primary)] uppercase text-sm tracking-tight">
                            {txn.type === "recharge" ? "Wallet Top-up" : txn.type === "usage" ? (txn.featureName || "Feature Unlock") : `${txn.planType} Subscription`}
                         </p>
                         <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                            {formatDate(txn.timestamp)} • {txn.type === "usage" ? "PrepCoins" : txn.paymentMethod}
                         </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`font-black text-lg ${txn.type === "recharge" ? "text-emerald-400" : "text-blue-400"}`}>
                         {txn.type === "recharge" ? `+₹${txn.amount}` : `-₹${txn.amount}`}
                      </p>
                      {txn.type === "recharge" && txn.coinsAdded && (
                         <p className="text-[10px] font-black text-emerald-500/80 uppercase flex items-center justify-end gap-1">
                            +{txn.coinsAdded} <Coins className="w-2.5 h-2.5" />
                         </p>
                      )}
                      <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-tighter mt-1">
                         ID: {txn.transactionId}
                      </p>
                   </div>
                </div>
             ))
          ) : (
             <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-500/5 flex items-center justify-center border border-dashed border-[var(--border-subtle)]">
                   <AlertCircle className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <div>
                   <p className="text-[var(--text-primary)] font-black uppercase tracking-widest">No transactions yet</p>
                   <p className="text-xs text-[var(--text-secondary)] font-medium max-w-[200px] mt-1">
                      Your wallet activity will appear here once you start using PrepEdge.
                   </p>
                </div>
                <Link href="/pricing">
                   <Button className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px]">
                      Recharge Now
                   </Button>
                </Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
