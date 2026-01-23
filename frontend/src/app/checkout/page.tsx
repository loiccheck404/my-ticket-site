"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_URL } from "@/config/api";

interface SeatData {
  id: string;
  seatNumber: string;
  section: string;
  price: number;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const [seats, setSeats] = useState<SeatData[]>([]);
  const [matchTitle, setMatchTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get data from URL params
    const seatsParam = searchParams.get("seats");
    const titleParam = searchParams.get("match");

    if (seatsParam) {
      setSeats(JSON.parse(decodeURIComponent(seatsParam)));
    }
    if (titleParam) {
      setMatchTitle(decodeURIComponent(titleParam));
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && seats.length > 0) {
      // Store current checkout data to resume after login
      localStorage.setItem(
        "pendingCheckout",
        JSON.stringify({ seats, matchTitle }),
      );
      alert("Please login to complete your booking");
      router.push("/login");
    }
  }, [isAuthenticated, seats, matchTitle, router]);

  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0);

  const handleBooking = async () => {
    if (!user) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const seatIds = seats.map((seat) => seat.id);

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          seatIds,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/payment/${data.data.orderId}`);
        localStorage.removeItem("pendingCheckout");
      } else {
        alert(`Booking failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred during booking");
    } finally {
      setLoading(false);
    }
  };

  if (seats.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">No seats selected</p>
          <button
            onClick={() => router.push("/")}
            className="text-yellow-500 hover:text-yellow-400"
          >
            ← Back to Matches
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-yellow-500 text-xl">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-yellow-500/20 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="text-yellow-500 hover:text-yellow-400 mb-4 flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-white">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Order Summary</h2>

          <div className="mb-4">
            <p className="text-gray-400 text-sm">Match</p>
            <p className="text-white text-lg font-semibold">{matchTitle}</p>
          </div>

          <div className="border-t border-gray-700 pt-4 mb-4">
            <p className="text-gray-400 text-sm mb-3">Selected Seats</p>
            <div className="space-y-2">
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex justify-between text-gray-300"
                >
                  <span>
                    Seat {seat.seatNumber} ({seat.section})
                  </span>
                  <span className="text-yellow-500">${seat.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-white text-2xl font-bold">
              <span>Total</span>
              <span className="text-yellow-500">${totalPrice}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Booking For</h2>
          <div className="text-gray-300">
            <p className="text-lg">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleBooking}
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-yellow-500 text-xl">Loading...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
