"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/api";

// Types
type CryptoType = "BTC" | "ETH" | "USDT";
type PaymentStatus = "PENDING" | "CONFIRMING" | "COMPLETED" | "EXPIRED";

interface PaymentDetails {
  transactionId: string;
  orderId: string;
  cryptocurrency: CryptoType;
  amount: {
    usd: number;
    crypto: number;
  };
  exchangeRate: number;
  walletAddress: string;
  paymentReference: string;
  qrCodeUrl: string;
  expiresAt: string;
  network: string;
}

interface PaymentStatusData {
  status: PaymentStatus;
  confirmations: number;
  timeRemaining: number;
  message?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();

  // Dynamically get orderId - check what key actually exists in params
  const getOrderId = () => {
    console.log("🔍 Getting orderId from params:", params);

    // Get all keys from params
    const keys = Object.keys(params);
    console.log("📋 Available keys:", keys);

    // If there's any key, use its value
    if (keys.length > 0) {
      const firstKey = keys[0];
      const value = params[firstKey];
      console.log(`✅ Found key "${firstKey}" with value:`, value);

      // Handle array values
      if (Array.isArray(value)) {
        return value[0] as string;
      }
      return value as string;
    }

    // Fallback: Parse from URL
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const match = path.match(/\/payment\/([^\/]+)/);
      if (match && match[1]) {
        console.log("✅ Extracted from URL:", match[1]);
        return match[1];
      }
    }

    console.log("❌ Could not find orderId");
    return "";
  };

  const [orderId, setOrderId] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Extract orderId when params are ready
  useEffect(() => {
    const id = getOrderId();
    setOrderId(id);
    console.log("💾 Set orderId to:", id);
  }, [params]);

  // Create payment when crypto is selected
  const createPayment = async (crypto: CryptoType) => {
    console.log("💰 Creating payment with orderId:", orderId);

    if (!orderId || orderId === "") {
      setError("Order ID is missing. Please try booking again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestBody = {
        orderId: orderId,
        cryptocurrency: crypto,
      };

      console.log("📤 Request:", requestBody);

      const response = await fetch(`${API_URL}/api/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("📥 Response:", data);

      if (data.success) {
        setPaymentDetails(data.payment);
        setSelectedCrypto(crypto);
        startPaymentMonitoring();
      } else {
        setError(data.error || "Failed to create payment");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Failed to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`${API_URL}/api/payment/check/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setPaymentStatus({
          status: data.payment.status,
          confirmations: data.payment.confirmations,
          timeRemaining: 0,
          message: data.payment.message,
        });

        if (data.payment.status === "COMPLETED") {
          setTimeout(() => {
            router.push(`/payment/success?orderId=${orderId}`);
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Error checking payment:", err);
    }
  };

  const startPaymentMonitoring = () => {
    checkPaymentStatus();
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 30000);
    return () => clearInterval(interval);
  };

  const getPaymentStatus = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`${API_URL}/api/payment/status/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setTimeRemaining(data.payment.timeRemaining);
      }
    } catch (err) {
      console.error("Error getting status:", err);
    }
  };

  useEffect(() => {
    if (paymentDetails) {
      getPaymentStatus();
      const interval = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [paymentDetails]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-500";
      case "CONFIRMING":
        return "text-blue-500";
      case "COMPLETED":
        return "text-green-500";
      case "EXPIRED":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const cryptos: { name: CryptoType; label: string; icon: string }[] = [
    { name: "BTC", label: "Bitcoin", icon: "₿" },
    { name: "ETH", label: "Ethereum", icon: "Ξ" },
    { name: "USDT", label: "Tether", icon: "₮" },
  ];

  if (!orderId || orderId === "") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">No Order ID Found</p>
          <p className="text-gray-400 mb-2">
            Please complete your booking first
          </p>
          <div className="bg-gray-900 rounded p-4 mb-6 text-left text-xs font-mono">
            <p className="text-gray-500 mb-2">Debug:</p>
            <p>Keys in params: {Object.keys(params).join(", ") || "none"}</p>
            <p>
              First key value:{" "}
              {Object.keys(params).length > 0
                ? String(params[Object.keys(params)[0]])
                : "N/A"}
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Crypto Payment</h1>
          <p className="text-gray-400">Order ID: {orderId}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-sm text-red-400 hover:text-red-300 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {!selectedCrypto && (
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Select Payment Method</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cryptos.map((crypto) => (
                <button
                  key={crypto.name}
                  onClick={() => createPayment(crypto.name)}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-yellow-500 hover:text-black transition-all rounded-lg p-6 flex flex-col items-center gap-3 disabled:opacity-50"
                >
                  <span className="text-4xl">{crypto.icon}</span>
                  <span className="text-xl font-bold">{crypto.label}</span>
                  <span className="text-sm text-gray-400">{crypto.name}</span>
                </button>
              ))}
            </div>

            {loading && (
              <p className="text-center text-yellow-500 mt-4">
                Creating payment...
              </p>
            )}
          </div>
        )}

        {selectedCrypto && paymentDetails && (
          <div className="space-y-6">
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Time Remaining</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {formatTime(timeRemaining)}
                </p>
              </div>
              {timeRemaining === 0 && (
                <p className="text-red-500 font-bold">EXPIRED</p>
              )}
            </div>

            <div className="bg-gray-900 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Send Payment</h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg mb-4">
                    <img
                      src={paymentDetails.qrCodeUrl}
                      alt="Payment QR Code"
                      width={250}
                      height={250}
                      className="w-[250px] h-[250px]"
                    />
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    Scan with your crypto wallet
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">
                      Cryptocurrency
                    </label>
                    <p className="text-xl font-bold">
                      {paymentDetails.cryptocurrency}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">
                      Amount to Send
                    </label>
                    <p className="text-2xl font-bold text-yellow-500">
                      {paymentDetails.amount.crypto}{" "}
                      {paymentDetails.cryptocurrency}
                    </p>
                    <p className="text-sm text-gray-400">
                      ≈ ${paymentDetails.amount.usd} USD
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">
                      Send to Address
                    </label>
                    <div className="bg-gray-800 rounded p-3 mt-1 break-all font-mono text-sm">
                      {paymentDetails.walletAddress}
                    </div>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          paymentDetails.walletAddress,
                        )
                      }
                      className="text-yellow-500 text-sm mt-2 hover:underline"
                    >
                      📋 Copy Address
                    </button>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Network</label>
                    <p className="text-sm font-bold uppercase">
                      {paymentDetails.network}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">
                      Payment Reference
                    </label>
                    <p className="text-xs font-mono text-gray-500">
                      {paymentDetails.paymentReference}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {paymentStatus && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Payment Status</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span
                      className={`font-bold ${getStatusColor(
                        paymentStatus.status,
                      )}`}
                    >
                      {paymentStatus.status}
                    </span>
                  </div>

                  {paymentStatus.confirmations > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Confirmations</span>
                      <span className="font-bold">
                        {paymentStatus.confirmations}
                      </span>
                    </div>
                  )}

                  {paymentStatus.message && (
                    <div className="bg-blue-500/10 border border-blue-500 rounded p-3 mt-4">
                      <p className="text-blue-500">{paymentStatus.message}</p>
                    </div>
                  )}

                  {paymentStatus.status === "COMPLETED" && (
                    <div className="bg-green-500/10 border border-green-500 rounded p-4 mt-4">
                      <p className="text-green-500 font-bold text-center">
                        🎉 Payment Confirmed! Redirecting...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="font-bold mb-3">⚠️ Important Instructions</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>
                  • Send the <strong>exact amount</strong> shown above
                </li>
                <li>
                  • Send to the <strong>correct network</strong> (
                  {paymentDetails.network})
                </li>
                <li>• Payment expires in {formatTime(timeRemaining)}</li>
                <li>
                  • Do not close this page - we'll auto-detect your payment
                </li>
                <li>• Confirmations may take 5-15 minutes</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
