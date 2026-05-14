"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  X,
  Smartphone,
  ChevronRight,
  Info,
  QrCode,
  Copy,
  Check
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { method: string; transactionId: string }) => void;
  planName: string;
  amount: string;
  numericAmount: number;
}

export default function SimulatedPaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  planName, 
  amount,
  numericAmount
}: SimulatedPaymentModalProps) {
  const [step, setStep] = useState<"method" | "card" | "upi" | "processing" | "success">("method");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("method");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setIsCopied(false);
    }
  }, [isOpen]);

  const handleProcessPayment = (method: string) => {
    setStep("processing");
    const generatedTxnId = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    setTxnId(generatedTxnId);

    // Simulate real network latency
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess({ method, transactionId: generatedTxnId });
      }, 2000);
    }, 3000);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText("demo@upi");
    setIsCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[var(--surface-base)] rounded-[2.5rem] border border-[var(--border-primary)] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[var(--text-primary)]">Secure Checkout</h3>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Powered by PrepEdge Pay</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === "method" && (
              <motion.div 
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/20 mb-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Item</p>
                      <h4 className="text-xl font-black text-[var(--text-primary)]">{planName}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Total</p>
                      <h4 className="text-2xl font-black text-[var(--text-primary)]">{amount}</h4>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-[var(--text-secondary)] ml-1">Select Payment Method</p>
                  <button 
                    onClick={() => setStep("card")}
                    className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-blue-500/20 transition-all">
                        <CreditCard className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-[var(--text-primary)]">Credit or Debit Card</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)]">Visa, Mastercard, AMEX</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>

                  <button 
                    onClick={() => setStep("upi")}
                    className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-green-500/50 hover:bg-green-500/5 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-green-500/20 transition-all">
                        <Smartphone className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-[var(--text-primary)]">UPI / QR Code</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)]">PhonePe, GPay, Paytm</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                  </button>
                </div>

                <div className="pt-4 flex items-start gap-3 p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
                   <Info className="w-5 h-5 text-yellow-400 shrink-0" />
                   <p className="text-[10px] leading-relaxed font-bold text-yellow-400/80 uppercase tracking-tight">
                     DEMO MODE: This is a simulated payment gateway. No real money will be charged.
                   </p>
                </div>
              </motion.div>
            )}

            {step === "card" && (
              <motion.div 
                key="card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                    />
                    <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM / YY"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">CVV</label>
                    <input 
                      type="password" 
                      placeholder="•••"
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => handleProcessPayment("card")}
                  disabled={cardNumber.length < 16}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 mt-4"
                >
                  Pay {amount} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                <button 
                  onClick={() => setStep("method")}
                  className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-widest transition-colors"
                >
                  Go Back
                </button>
              </motion.div>
            )}

            {step === "upi" && (
              <motion.div 
                key="upi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-3xl border-4 border-green-500/20 shadow-2xl">
                    {/* Simplified QR Placeholder */}
                    <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-2xl border border-slate-200 overflow-hidden">
                       <img 
                         src="/dummy-qr.png" 
                         alt="QR Code" 
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           e.currentTarget.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=demo@upi&pn=PrepEdge&am=" + numericAmount;
                         }}
                       />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Scan with any UPI App</p>
                    <div className="flex items-center gap-2 justify-center py-2 px-4 bg-white/5 rounded-xl border border-white/10 group cursor-pointer hover:bg-white/10 transition-all" onClick={copyUpiId}>
                       <span className="font-bold text-[var(--text-primary)]">demo@upi</span>
                       {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[var(--text-secondary)]" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button 
                    onClick={() => handleProcessPayment("upi")}
                    className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest shadow-xl shadow-green-500/20"
                  >
                    I Have Paid <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  
                  <button 
                    onClick={() => setStep("method")}
                    className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase tracking-widest transition-colors"
                  >
                    Cancel Payment
                  </button>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="relative">
                  <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-black text-[var(--text-primary)] mb-2">Verifying Payment</h4>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">Please do not close this window...</p>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[var(--text-primary)] mb-2">Payment Successful!</h4>
                  <p className="text-sm font-bold text-[var(--text-secondary)] mb-4">Transaction ID: {txnId}</p>
                  <p className="text-xs font-bold text-green-500 uppercase tracking-widest">Balance Updated Instantly</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex items-center justify-center gap-6">
          <div className="flex items-center gap-4 opacity-50 grayscale brightness-200">
             <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/RuPay_logo.svg" alt="RuPay" className="h-3" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-3" />
          </div>
          <div className="w-[1px] h-4 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[var(--text-secondary)]" />
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">PCI-DSS Compliant</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
