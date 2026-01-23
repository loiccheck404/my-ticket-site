"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import TicketPanel from "@/components/TicketPanel";
import { API_URL } from "@/config/api";

interface Match {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  imageUrl: string;
  category: string;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/matches`)
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching matches:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1A237E]/20 to-[#0A0A0A]">
      {/* Modern Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[#FF6B35]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFD700] rounded-lg flex items-center justify-center font-bebas text-2xl text-white">
              26
            </div>
            <h1 className="text-2xl font-bebas tracking-wider bg-gradient-to-r from-[#FF6B35] via-[#FFD700] to-[#00BCD4] bg-clip-text text-transparent">
              FIFA WORLD CUP 2026
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsPanelOpen(true)}
                  className="text-[#FFD700] hover:text-[#FF6B35] transition-colors font-medium"
                >
                  👋 {user?.firstName}
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[#FF6B35]/50 transition-all transform hover:scale-105"
                >
                  Dashboard
                </button>
                <button
                  onClick={logout}
                  className="bg-white/10 backdrop-blur text-white px-6 py-2 rounded-full hover:bg-white/20 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="text-[#FFD700] hover:text-[#FF6B35] transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => (window.location.href = "/signup")}
                  className="bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[#FF6B35]/50 transition-all transform hover:scale-105"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Animation */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6B35]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00BCD4]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-[#FF6B35]/20 to-[#FFD700]/20 backdrop-blur-sm rounded-full border border-[#FFD700]/30">
            <p className="text-[#FFD700] font-medium uppercase tracking-wider text-sm">
              🏆 Official Ticketing Platform
            </p>
          </div>

          <h1 className="text-7xl md:text-9xl font-bebas tracking-tight mb-6 leading-none">
            <span className="block bg-gradient-to-r from-[#FF6B35] via-[#FFD700] to-[#00BCD4] bg-clip-text text-transparent animate-float">
              WORLD CUP
            </span>
            <span className="block text-white text-8xl md:text-[10rem]">
              2026
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the ultimate football celebration across{" "}
            <span className="text-[#FF6B35] font-semibold">USA</span>,{" "}
            <span className="text-[#00BCD4] font-semibold">Canada</span>, and{" "}
            <span className="text-[#FFD700] font-semibold">Mexico</span>
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() =>
                document
                  .getElementById("matches")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-[#FF6B35]/50 transition-all transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Explore Matches
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </span>
            </button>
            <button className="bg-white/10 backdrop-blur-lg text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition border border-white/20">
              View Schedule
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-5xl font-bebas bg-gradient-to-r from-[#FF6B35] to-[#FFD700] bg-clip-text text-transparent">
                48
              </p>
              <p className="text-gray-400 text-sm uppercase tracking-wide">
                Teams
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bebas bg-gradient-to-r from-[#00BCD4] to-[#FFD700] bg-clip-text text-transparent">
                104
              </p>
              <p className="text-gray-400 text-sm uppercase tracking-wide">
                Matches
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bebas bg-gradient-to-r from-[#FFD700] to-[#FF6B35] bg-clip-text text-transparent">
                16
              </p>
              <p className="text-gray-400 text-sm uppercase tracking-wide">
                Cities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Section */}
      <div id="matches" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-6xl font-bebas mb-4">
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFD700] bg-clip-text text-transparent">
              UPCOMING
            </span>{" "}
            <span className="text-white">MATCHES</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Secure your seats for the biggest football tournament in history
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF6B35]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {matches.map((match, index) => (
              <div
                key={match.id}
                className="group relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF6B35]/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6B35]/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Category Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {match.category}
                  </span>
                </div>

                {/* Image Placeholder with Gradient */}
                <div className="h-48 bg-gradient-to-br from-[#1A237E] via-[#FF6B35]/20 to-[#FFD700]/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/stadium-pattern.svg')] opacity-10"></div>
                  <p className="text-white/90 text-2xl font-bebas text-center px-4 relative z-10">
                    {match.title}
                  </p>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 font-bebas tracking-wide">
                    {match.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg
                        className="w-4 h-4 text-[#FFD700]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {match.venue}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <svg
                        className="w-4 h-4 text-[#00BCD4]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(match.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                    {match.description}
                  </p>

                  <button
                    onClick={() =>
                      (window.location.href = `/matches/${match.id}`)
                    }
                    className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#FF6B35]/50 transition-all transform group-hover:scale-105"
                  >
                    Book Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 backdrop-blur-xl py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-[#FFD700] font-bebas text-2xl mb-4">
                FIFA WORLD CUP 2026
              </h3>
              <p className="text-gray-400 text-sm">
                Official ticketing platform for the world's biggest football
                tournament
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-[#FF6B35] transition cursor-pointer">
                  Schedule
                </li>
                <li className="hover:text-[#FF6B35] transition cursor-pointer">
                  Venues
                </li>
                <li className="hover:text-[#FF6B35] transition cursor-pointer">
                  Teams
                </li>
                <li className="hover:text-[#FF6B35] transition cursor-pointer">
                  FAQ
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Powered By</h4>
              <p className="text-gray-400 text-sm">🔐 Blockchain Technology</p>
              <p className="text-gray-400 text-sm">
                💳 Cryptocurrency Payments
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
            © 2026 FIFA World Cup. All rights reserved.
          </div>
        </div>
      </footer>

      {user && (
        <TicketPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          userId={user.id}
        />
      )}
    </div>
  );
}
