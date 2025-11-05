"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/"); // Redirect to homepage
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-green-500">
            Payment Confirmed!
          </h1>

          <p className="text-xl text-gray-400 mb-2">
            Your ticket purchase was successful
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-900 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">Order Confirmed</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <span className="text-gray-400">Order ID</span>
              <span className="font-mono text-sm">{orderId}</span>
            </div>

            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
              <p className="text-green-500 text-center">
                ✅ Your seats have been confirmed!
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-4">📧 What's Next?</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <span>1.</span>
              <span>Check your email for your tickets</span>
            </li>
            <li className="flex items-start gap-2">
              <span>2.</span>
              <span>Bring your tickets (printed or mobile) to the venue</span>
            </li>
            <li className="flex items-start gap-2">
              <span>3.</span>
              <span>Arrive 30 minutes before match time</span>
            </li>
            <li className="flex items-start gap-2">
              <span>4.</span>
              <span>Enjoy the match! ⚽</span>
            </li>
          </ul>
        </div>

        {/* Redirect Notice */}
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            Redirecting to homepage in {countdown} seconds...
          </p>

          <button
            onClick={() => router.push("/")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Go to Homepage Now
          </button>
        </div>
      </div>
    </div>
  );
}
