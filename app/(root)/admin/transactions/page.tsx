"use client";

import { useState, useEffect } from "react";
import { 
  getAllTransactions 
} from "@/lib/actions/payment.action";
import { getAllUsers } from "@/lib/actions/auth.action";
import { getAllReviews, getAllInterviews, getAllFeedbacks } from "@/lib/actions/general.action";
import { exportTransactionsToExcel, exportUsersToExcel, exportUserActivityToExcel } from "@/lib/utils/export";
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Search,
  RefreshCcw,
  Trophy,
  Users,
  UserCheck,
  Shield
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user || user.email !== "sudeepverma2006@gmail.com") {
        redirect("/profile");
      }
    }
    checkAuth();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      if (password === "@sudeep") {
        setIsAuthenticated(true);
        fetchData();
        toast.success("Welcome, Owner. Access granted.");
      } else {
        toast.error("Invalid Admin Credentials.");
      }
      setVerifying(false);
    }, 1000);
  };

  const fetchData = async () => {
    setLoading(true);
    const result = await getAllTransactions();
    if (result.success) {
      setTransactions(result.transactions || []);
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter(txn => 
    txn.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.planType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportUsers = async () => {
    setLoading(true);
    const userResult = await getAllUsers();
    const reviewResult = await getAllReviews();

    if (userResult.success) {
      const users = userResult.users || [];
      const reviews = reviewResult.success ? (reviewResult.reviews || []) : [];

      // Map ratings to users
      const usersWithRatings = users.map((u: any) => {
        const userReview = reviews.find((r: any) => r.userId === u.id) as any;
        return {
          ...u,
          rating: userReview ? userReview.rating : "No Rating"
        };
      });

      exportUsersToExcel(usersWithRatings);
      toast.success("User Database Exported!");
    } else {
      toast.error("Failed to fetch users.");
    }
    setLoading(false);
  };

  const handleExportActivity = async () => {
    setLoading(true);
    const userResult = await getAllUsers();
    const interviewResult = await getAllInterviews();
    const feedbackResult = await getAllFeedbacks();

    if (userResult.success && interviewResult.success && feedbackResult.success) {
      const users = userResult.users || [];
      const allInterviews = (interviewResult as any).interviews || [];
      const allFeedbacks = feedbackResult.feedbacks || [];

      // Map activity to users
      const userActivity = users.map((u: any) => {
        const userInterviews = allInterviews.filter((i: any) => i.userId === u.id);
        const validInterviewIds = new Set(userInterviews.map((i: any) => i.id));
        
        // Only count feedbacks if the interview document exists
        const userFeedbacks = allFeedbacks.filter((f: any) => f.userId === u.id && validInterviewIds.has(f.interviewId));
        
        const uniqueRoles = Array.from(new Set(userInterviews.map((i: any) => i.role).filter(Boolean)));
        
        return {
          name: u.name,
          email: u.email,
          totalInterviews: userInterviews.length,
          uniqueRolesCount: uniqueRoles.length,
          rolesList: uniqueRoles.join(", ")
        };
      });

      exportUserActivityToExcel(userActivity);
      toast.success("User Activity Report Generated!");
    } else {
      toast.error("Failed to fetch activity data.");
    }
    setLoading(false);
  };

  const totalRevenue = transactions.reduce((acc, txn) => acc + (txn.amount || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)] px-4">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-md p-10 rounded-[3rem] bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-2xl text-center space-y-8"
         >
            <div className="w-20 h-20 bg-purple-600/10 rounded-3xl flex items-center justify-center mx-auto">
               <Shield className="w-10 h-10 text-purple-400" />
            </div>
            <div>
               <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Owner Verification</h2>
               <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2">Restricted Access Area</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
               <input 
                 type="password" 
                 placeholder="Enter Admin Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl py-4 px-6 text-center text-lg font-bold outline-none focus:border-purple-500/50 transition-all"
                 autoFocus
               />
               <button 
                 type="submit"
                 disabled={verifying}
                 className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95 disabled:opacity-50"
               >
                  {verifying ? <RefreshCcw className="w-5 h-5 animate-spin mx-auto" /> : "Unlock Dashboard"}
               </button>
            </form>

            <Link href="/profile" className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors">
               Return to Profile
            </Link>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Link href="/profile" className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest hover:underline mb-4">
             <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight">Admin <span className="text-blue-500">Analytics</span></h1>
          <p className="text-[var(--text-secondary)] font-medium mt-2">Oversee all platform transactions and business growth.</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={fetchData}
             className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[var(--text-secondary)] hover:text-blue-400 transition-colors"
           >
              <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
           </button>
           <button 
             onClick={handleExportActivity}
             disabled={loading}
             className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-700 transition-all active:scale-95 disabled:opacity-50"
           >
              <Smartphone className="w-5 h-5" />
              Users Activity
           </button>
           <button 
             onClick={() => exportTransactionsToExcel(transactions, "Admin", true)}
             disabled={loading || transactions.length === 0}
             className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
           >
              <FileSpreadsheet className="w-5 h-5" />
              Export Payments
           </button>
           <button 
             onClick={handleExportUsers}
             disabled={loading}
             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
           >
              <UserCheck className="w-5 h-5" />
              Export User DB
           </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 rounded-[2.5rem] bg-blue-600/10 border border-blue-500/20">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Total Revenue</p>
            <h3 className="text-4xl font-black text-[var(--text-primary)]">₹{totalRevenue.toLocaleString()}</h3>
         </div>
         <div className="p-8 rounded-[2.5rem] bg-purple-600/10 border border-purple-500/20">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-2">Total Transactions</p>
            <h3 className="text-4xl font-black text-[var(--text-primary)]">{transactions.length}</h3>
         </div>
         <div className="p-8 rounded-[2.5rem] bg-amber-600/10 border border-amber-500/20">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">Active Users</p>
            <h3 className="text-4xl font-black text-[var(--text-primary)]">{new Set(transactions.map(t => t.userId)).size}</h3>
         </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-[var(--border-subtle)] flex flex-col md:flex-row justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-500/10 rounded-2xl text-[var(--text-secondary)]">
                 <Users className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Recent Activity</h3>
                 <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Real-time payment logs</p>
              </div>
           </div>

           <div className="relative group max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by user or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--surface-base)] border border-[var(--border-subtle)] rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-blue-500/50 outline-none transition-all"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">User</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Transaction ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Plan/Type</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Method</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Date</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                 {loading ? (
                    <tr>
                       <td colSpan={6} className="px-8 py-20 text-center">
                          <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">Synchronizing Logs...</p>
                       </td>
                    </tr>
                 ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((txn) => (
                       <tr key={txn.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6">
                             <p className="font-black text-[var(--text-primary)] text-sm">{txn.userName}</p>
                             <p className="text-[10px] font-medium text-[var(--text-muted)] truncate max-w-[150px]">{txn.userId}</p>
                          </td>
                          <td className="px-8 py-6">
                             <code className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg">
                                {txn.transactionId}
                             </code>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                   txn.type === "recharge" ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400"
                                }`}>
                                   {txn.type}
                                </span>
                                <span className="text-xs font-bold text-[var(--text-secondary)]">{txn.planType || "Wallet"}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <p className="font-black text-sm text-[var(--text-primary)]">₹{txn.amount}</p>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                {txn.paymentMethod === "Card" ? <CreditCard className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                                <span className="text-xs font-bold">{txn.paymentMethod}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <p className="text-xs font-medium text-[var(--text-secondary)]">{new Date(txn.timestamp).toLocaleDateString()}</p>
                          </td>
                       </tr>
                    ))
                 ) : (
                    <tr>
                       <td colSpan={6} className="px-8 py-20 text-center">
                          <p className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">No matching transactions found</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
