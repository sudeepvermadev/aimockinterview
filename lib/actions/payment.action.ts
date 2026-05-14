"use server";
import { adminDb } from "@/firebase/admin";
import { createNotification } from "./notifications.action";
import { revalidatePath } from "next/cache";

const COIN_CONVERSION_RATE = 10; // ₹1 = 10 PrepCoins

export async function rechargeWallet(userId: string, inrAmount: number, paymentMethod: string) {
  try {
    const coinsToAdd = inrAmount * COIN_CONVERSION_RATE;
    const transactionId = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, message: "User not found." };
    }

    const currentBalance = userDoc.data()?.walletBalance || 0;
    const newBalance = currentBalance + coinsToAdd;

    // Use a transaction to ensure atomicity
    await adminDb.runTransaction(async (transaction) => {
      // Update user wallet
      transaction.update(userRef, {
        walletBalance: newBalance,
        lastRechargeAt: timestamp
      });

      // Create transaction record
      const txnRef = adminDb.collection("transactions").doc(transactionId);
      transaction.set(txnRef, {
        userId,
        amount: inrAmount,
        coinsAdded: coinsToAdd,
        type: "recharge",
        paymentMethod,
        transactionId,
        timestamp,
        status: "success",
      });
    });

    // Create notification
    await createNotification({
      userId,
      type: "recharge",
      title: "Recharge Successful! 💰",
      message: `You have successfully added ${coinsToAdd} PrepCoins to your wallet. Transaction ID: ${transactionId}`,
    }).catch(e => console.error("Notification failed:", e));

    revalidatePath("/profile");
    revalidatePath("/pricing");

    return { 
      success: true, 
      message: "Wallet recharged successfully!", 
      transactionId, 
      coinsAdded: coinsToAdd,
      newBalance 
    };
  } catch (error: any) {
    console.error("Recharge Error:", error);
    return { success: false, message: error.message || "Failed to recharge wallet." };
  }
}

export async function purchaseSubscription(userId: string, planType: 'weekly' | 'monthly' | 'yearly', inrAmount: number, paymentMethod: string) {
  try {
    const transactionId = `SUB-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    
    // Calculate expiry date
    const expiryDate = new Date();
    if (planType === 'weekly') expiryDate.setDate(expiryDate.getDate() + 7);
    else if (planType === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
    else if (planType === 'yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const userRef = adminDb.collection("users").doc(userId);

    await adminDb.runTransaction(async (transaction) => {
      // Update user pro status
      transaction.update(userRef, {
        isPro: true,
        plan: planType,
        planType: planType,
        planExpiresAt: expiryDate.toISOString(),
        planUpdatedAt: timestamp
      });

      // Create transaction record
      const txnRef = adminDb.collection("transactions").doc(transactionId);
      transaction.set(txnRef, {
        userId,
        amount: inrAmount,
        type: "subscription",
        planType,
        paymentMethod,
        transactionId,
        timestamp,
        status: "success",
      });
    });

    // Create notification
    await createNotification({
      userId,
      type: "subscription",
      title: "Subscription Active! 🚀",
      message: `Welcome to PrepEdge Pro! Your ${planType} plan is now active until ${expiryDate.toLocaleDateString()}.`,
    }).catch(e => console.error("Notification failed:", e));

    revalidatePath("/profile");
    revalidatePath("/pricing");

    return { 
      success: true, 
      message: `Upgraded to ${planType} plan successfully!`, 
      transactionId,
      expiresAt: expiryDate.toISOString()
    };
  } catch (error: any) {
    console.error("Subscription Error:", error);
    return { success: false, message: error.message || "Failed to purchase subscription." };
  }
}

export async function getTransactionHistory(userId: string) {
  try {
    const snapshot = await adminDb.collection("transactions")
      .where("userId", "==", userId)
      .get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort manually to avoid composite index requirement
    transactions.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return { success: true, transactions };
  } catch (error: any) {
    console.error("Fetch Transactions Error:", error);
    return { success: false, message: error.message || "Failed to fetch transaction history." };
  }
}

/**
 * Admin Action: Get all transactions for all users
 */
export async function getAllTransactions() {
  try {
    const transactionsSnapshot = await adminDb
      .collection("transactions")
      .limit(500)
      .get();

    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort manually to avoid composite index requirement
    transactions.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Enrich transactions with user names
    const enrichedTransactions = await Promise.all(transactions.map(async (txn: any) => {
      const userDoc = await adminDb.collection("users").doc(txn.userId).get();
      return {
        ...txn,
        userName: userDoc.exists ? userDoc.data()?.name : "Unknown User"
      };
    }));

    return { success: true, transactions: enrichedTransactions };
  } catch (error: any) {
    console.error("❌ Get All Transactions Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Deduct coins from user's wallet for premium features
 */
export async function deductCoins(userId: string, amount: number, featureName: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { success: false, message: "User not found." };
    }

    const userData = userDoc.data();
    const currentBalance = userData?.walletBalance || 0;

    if (currentBalance < amount) {
      return { success: false, message: "Insufficient PrepCoins. Please recharge your wallet." };
    }

    const newBalance = currentBalance - amount;
    const transactionId = `SPEND-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    await adminDb.runTransaction(async (transaction) => {
      // Update balance
      transaction.update(userRef, {
        walletBalance: newBalance
      });

      // Log transaction
      const txnRef = adminDb.collection("transactions").doc(transactionId);
      transaction.set(txnRef, {
        userId,
        amount: 0, // No INR cost for deduction
        coinsDeducted: amount,
        type: "usage",
        featureName,
        transactionId,
        timestamp,
        status: "success",
      });
    });

    // Create notification
    await createNotification({
      userId,
      type: "usage",
      title: "PrepCoins Used 🪙",
      message: `You spent ${amount} PrepCoins to unlock ${featureName}. Remaining balance: ${newBalance} Coins.`,
    }).catch(e => console.error("Notification failed:", e));

    revalidatePath("/profile");
    revalidatePath("/pricing");

    return { 
      success: true, 
      message: `Successfully used ${amount} PrepCoins.`, 
      newBalance 
    };
  } catch (error: any) {
    console.error("Deduct Coins Error:", error);
    return { success: false, message: error.message || "Failed to deduct coins." };
  }
}

export async function awardRewardBundle(userId: string, coins: number, bundleName: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return { success: false, error: "User not found" };

    const currentBalance = userDoc.data()?.walletBalance || 0;
    const newBalance = currentBalance + coins;
    const transactionId = `GIFT-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    await adminDb.runTransaction(async (transaction) => {
      transaction.update(userRef, {
        walletBalance: newBalance
      });

      const txnRef = adminDb.collection("transactions").doc(transactionId);
      transaction.set(txnRef, {
        userId,
        amount: 0,
        coinsAdded: coins,
        type: "recharge",
        paymentMethod: `Reward: ${bundleName} 🎁`,
        transactionId,
        timestamp,
        status: "success",
      });
    });

    await createNotification({
      userId,
      type: "recharge",
      title: `${bundleName} Unlocked! 🎁`,
      message: `Congratulations! You've been awarded ${coins} PrepCoins for your consistency.`,
    });

    revalidatePath("/profile");
    return { success: true, newBalance };
  } catch (error) {
    console.error("❌ Reward Error:", error);
    return { success: false };
  }
}
