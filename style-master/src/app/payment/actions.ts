
'use server';

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ConfirmPaymentBody {
    paymentKey: string;
    orderId: string;
    amount: number;
}

/**
 * Confirms a payment with the Toss Payments API.
 * @param body The payment confirmation details.
 * @returns The payment confirmation response from Toss.
 */
export async function confirmPayment(body: ConfirmPaymentBody): Promise<any> {
    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
        throw new Error("Toss Payments 시크릿 키가 설정되지 않았습니다.");
    }

    const basicToken = Buffer.from(`${secretKey}:`, 'utf-8').toString('base64');
    
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
        method: "POST",
        headers: {
            Authorization: `Basic ${basicToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`결제 승인 실패: ${data.message || '알 수 없는 오류'}`);
    }

    // Save order to Firestore
    try {
        await addDoc(collection(db, "orders"), {
            ...data,
            createdAt: serverTimestamp(),
        });
    } catch(dbError) {
        // Even if DB save fails, the payment is already confirmed.
        // Log this for manual reconciliation.
        console.error("!!! CRITICAL: Payment confirmed but failed to save order to Firestore.", dbError);
        console.error("Order Details:", data);
    }
    
    return data;
}
