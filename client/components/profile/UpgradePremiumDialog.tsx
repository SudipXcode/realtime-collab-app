
"use client"

import { useOutsideClick } from '@/hooks/useOutSideclick';
import { usePayment } from '@/hooks/usePayment';
import { showToast } from '@/lib/toast';
import { Check, X } from 'lucide-react';
import React, { useEffect } from 'react'

const UpgradePremiumDialog = ({ open, onOpenChange }) => {
    const closeRef = React.useRef(null)
    useOutsideClick(closeRef, () => onOpenChange(false), open);

    const { pay, loading } = usePayment();

    // ✅ FIX: Check for pending payment on component mount
    useEffect(() => {
        if (!open) {
            const pendingTx = sessionStorage.getItem("pending_transaction_uuid");
            const initiatedAt = sessionStorage.getItem("payment_initiated_at");

            // If user was in payment process less than 10 minutes ago
            if (pendingTx && initiatedAt) {
                const elapsed = Date.now() - parseInt(initiatedAt);
                if (elapsed < 10 * 60 * 1000) {
                    // Payment was initiated recently, keep checking status
                    // The backend callback will handle the actual verification
                    console.log("Pending payment found:", pendingTx);
                }
            }
        }
    }, [open]);

    const handlePayPremium = async () => {
        try {
            const success = await pay();
            if (success) {
                // Don't close dialog here - let the redirect handle it
                // The payment gateway will redirect back
            } else {
                showToast("Failed to initiate payment. Please try again.", "error");
            }
        } catch (error) {
            console.error("Payment error:", error);
            showToast("Payment error. Please try again.", "error");
        }
    }

    if (!open) return null

    return (
        <div className='w-full h-screen flex justify-center items-center bg-black/40 fixed top-0 z-50'>
            <div ref={closeRef} className='w-100 relative flex flex-col justify-between border border-[#2D2D2D] bg-[#242424] h-auto p-4 rounded-2xl'>
                <button 
                    onClick={() => onOpenChange(false)} 
                    className='absolute top-4 text-[#9191a0] hover:text-[#4772FA] transition ease-linear duration-150 right-4'
                    disabled={loading}
                >
                    <X size={18} strokeWidth={2.5} />
                </button>
                
                <h1 className='text-[18px] font-bold'>Upgrade to premium</h1>
                
                <ul className='w-full h-auto mt-5 flex flex-col gap-2'>
                    <li className='flex items-center gap-2 text-[13px] font-medium text-[#9191a0]'><Check className='text-[#4772FB]' size={16} />Multiple Calender Views</li>
                    <li className='flex items-center gap-2 text-[13px] font-medium text-[#9191a0]'><Check className='text-[#4772FB]' size={16} />Calendar Subscription</li>
                    <li className='flex items-center gap-2 text-[13px] font-medium text-[#9191a0]'><Check className='text-[#4772FB]' size={16} />Task Duration</li>
                    <li className='flex items-center gap-2 text-[13px] font-medium text-[#9191a0]'><Check className='text-[#4772FB]' size={16} />200+ lists</li>
                    <li className='flex items-center gap-2 text-[13px] font-medium text-[#9191a0]'><Check className='text-[#4772FB]' size={16} />Collaboration with 20+ users per list</li>
                    <li className='flex items-center gap-2 text-[13px] font-medium text-[#9191a0]'><Check className='text-[#4772FB]' size={16} />Statistics</li>
                    <li className='flex items-center gap-2 text-[13px] font-medium text-[#9191a0]'><Check className='text-[#4772FB]' size={16} />More</li>
                </ul>
                
                <div className='w-full h-auto flex flex-col gap-4 mt-4'>
                    <div className='w-full flex flex-col gap-1 h-auto border-2 border-[#2D2D2D] rounded-xl py-3 px-4'>
                        <p className='text-[13px] font-medium'>Monthly</p>
                        <h4 className='text-[14px] font-semibold'>NPR 149.00 / m</h4>
                    </div>
                    
                    <div className='w-full h-auto flex justify-between'>
                        <p className='text-[13px] font-medium'>Payment Method</p>
                        <img className='w-auto h-4.5 object-contain' src="https://epicmountainbike.com/themes/default/shop/assets/images/esewa-logo.png" alt="eSewa" />
                    </div>
                    
                    <button
                        onClick={handlePayPremium}
                        disabled={loading}
                        className='bg-[#FF8E0A] w-full h-auto p-2 rounded-2xl text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition'
                    >
                        {loading ? "Processing..." : "NPR 149.00 / m  Upgrade Now"}
                    </button>
                    
                    <p className='text-[#7C7C7C] text-center text-[12px] font-medium'>I have read and accept Pricing Terms. Cancel anytime</p>
                </div>
            </div>
        </div>
    )
}

export default UpgradePremiumDialog;