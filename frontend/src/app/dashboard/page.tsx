"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Seat {
  seatNumber: string;
  row: string;
  section: string;
}

interface Match {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  imageUrl: string;
}

interface Ticket {
  ticketType: string;
  price: number;
  quantity: number;
  match: Match;
  seat: Seat | null;
}

interface Transaction {
  cryptocurrency: string;
  cryptoAmount: number;
  walletAddress: string;
  status: string;
  confirmations: number;
}

interface Order {
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  user: {
    name: string;
    email: string;
  };
  tickets: Ticket[];
  transaction: Transaction | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tickets"); // tickets, orders, profile
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Fetch user orders
    fetchOrders(userData.id);
  }, [router]);

  const fetchOrders = async (userId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/user/${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "COMPLETED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FFD700] text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-[#FFD700] py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#FFD700]">
                My Dashboard
              </h1>
              {user && (
                <p className="text-gray-400 mt-2">
                  Welcome back, {user.firstName} {user.lastName}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "tickets"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "orders"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Order History
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "profile"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Profile
          </button>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "tickets" && (
            <div>
              <h2 className="text-2xl font-bold text-[#FFD700] mb-6">
                My Tickets ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-xl">No tickets yet</p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-6 py-3 bg-[#FFD700] text-black font-bold rounded hover:bg-yellow-500 transition"
                  >
                    Browse Matches
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orders.map((order) =>
                    order.tickets.map((ticket, idx) => (
                      <div
                        key={`${order.orderId}-${idx}`}
                        className="bg-gradient-to-r from-gray-900 to-black border border-[#FFD700] rounded-lg p-6 hover:shadow-lg hover:shadow-[#FFD700]/20 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-6">
                            {/* Match Image */}
                            <img
                              src={ticket.match.imageUrl}
                              alt={ticket.match.title}
                              className="w-32 h-32 object-cover rounded"
                            />

                            {/* Match Info */}
                            <div>
                              <h3 className="text-2xl font-bold text-[#FFD700]">
                                {ticket.match.title}
                              </h3>
                              <p className="text-gray-400 mt-1">
                                {ticket.match.description}
                              </p>
                              <div className="mt-4 space-y-2">
                                <p className="text-white">
                                  📅 {formatDate(ticket.match.date)}
                                </p>
                                <p className="text-white">
                                  📍 {ticket.match.venue}
                                </p>
                                {ticket.seat && (
                                  <p className="text-white">
                                    🎫 {ticket.seat.section} Section - Row{" "}
                                    {ticket.seat.row} - Seat{" "}
                                    {ticket.seat.seatNumber}
                                  </p>
                                )}
                                <p className="text-[#FFD700] font-bold">
                                  {ticket.ticketType} - ${ticket.price}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="text-right">
                            <span
                              className={`${getStatusColor(
                                order.status
                              )} text-white px-4 py-2 rounded font-bold`}
                            >
                              {order.status}
                            </span>
                            {order.transaction && (
                              <div className="mt-4 text-sm text-gray-400">
                                <p>
                                  Paid with {order.transaction.cryptocurrency}
                                </p>
                                <p>
                                  {order.transaction.confirmations}{" "}
                                  confirmations
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-[#FFD700] mb-6">
                Order History ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-xl">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.orderId}
                      className="bg-gradient-to-r from-gray-900 to-black border border-[#FFD700] rounded-lg p-6"
                    >
                      {/* Order Header */}
                      <div className="flex justify-between items-start border-b border-gray-700 pb-4">
                        <div>
                          <h3 className="text-xl font-bold text-[#FFD700]">
                            Order #{order.orderId.slice(0, 8)}...
                          </h3>
                          <p className="text-gray-400 mt-1">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`${getStatusColor(
                              order.status
                            )} text-white px-4 py-2 rounded font-bold`}
                          >
                            {order.status}
                          </span>
                          <p className="text-white text-xl font-bold mt-2">
                            ${order.totalAmount}
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mt-4 space-y-3">
                        {order.tickets.map((ticket, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 bg-black/50 p-3 rounded"
                          >
                            <img
                              src={ticket.match.imageUrl}
                              alt={ticket.match.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="text-white font-semibold">
                                {ticket.match.title}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {ticket.ticketType} - {ticket.seat?.section}{" "}
                                Section
                              </p>
                            </div>
                            <p className="text-[#FFD700] font-bold">
                              ${ticket.price}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Payment Info */}
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Payment Method:</span>
                          <span className="text-white font-semibold">
                            {order.paymentMethod}
                            {order.transaction &&
                              ` (${order.transaction.cryptocurrency})`}
                          </span>
                        </div>
                        {order.transaction && (
                          <>
                            <div className="flex justify-between text-sm mt-2">
                              <span className="text-gray-400">
                                Crypto Amount:
                              </span>
                              <span className="text-white">
                                {order.transaction.cryptoAmount}{" "}
                                {order.transaction.cryptocurrency}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                              <span className="text-gray-400">
                                Confirmations:
                              </span>
                              <span className="text-white">
                                {order.transaction.confirmations}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-[#FFD700] mb-6">
                Profile
              </h2>

              {user && (
                <div className="max-w-2xl">
                  {/* Profile Info Card */}
                  <div className="bg-gradient-to-r from-gray-900 to-black border border-[#FFD700] rounded-lg p-8">
                    <div className="space-y-6">
                      {/* Name */}
                      <div>
                        <label className="text-gray-400 text-sm">
                          Full Name
                        </label>
                        <p className="text-white text-xl font-semibold mt-1">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white text-xl mt-1">{user.email}</p>
                      </div>

                      {/* User ID */}
                      <div>
                        <label className="text-gray-400 text-sm">User ID</label>
                        <p className="text-gray-500 text-sm mt-1 font-mono">
                          {user.id}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                        <div className="bg-black/50 p-4 rounded text-center">
                          <p className="text-[#FFD700] text-3xl font-bold">
                            {orders.length}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Total Orders
                          </p>
                        </div>
                        <div className="bg-black/50 p-4 rounded text-center">
                          <p className="text-[#FFD700] text-3xl font-bold">
                            {orders.reduce(
                              (sum, order) => sum + order.tickets.length,
                              0
                            )}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Total Tickets
                          </p>
                        </div>
                      </div>

                      {/* Logout Button */}
                      <div className="pt-4 border-t border-gray-700">
                        <button
                          onClick={() => {
                            localStorage.removeItem("user");
                            localStorage.removeItem("token");
                            router.push("/login");
                          }}
                          className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="mt-6 bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Account Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Member Since</span>
                        <span className="text-white">November 2025</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Status</span>
                        <span className="text-green-500">Active</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Spent</span>
                        <span className="text-[#FFD700] font-bold">
                          $
                          {orders.reduce(
                            (sum, order) => sum + order.totalAmount,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
