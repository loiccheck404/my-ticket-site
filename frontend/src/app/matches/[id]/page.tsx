"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Match {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
}

interface Ticket {
  id: string;
  type: string;
  price: number;
  availableCount: number;
  category: number;
  color: string;
}

interface Seat {
  isBooked: any;
  id: string;
  seatNumber: string;
  row: string;
  section: string;
  ticket: {
    price: number;
    category: number;
    color: string;
  };
}

export default function MatchDetails() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSeatsData, setSelectedSeatsData] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch match details
  useEffect(() => {
    fetch(`http://localhost:5000/api/matches/${matchId}`)
      .then((res) => res.json())
      .then((data) => {
        setMatch(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching match:", error);
        setLoading(false);
      });
  }, [matchId]);

  // Fetch ticket types
  useEffect(() => {
    fetch(`http://localhost:5000/api/matches/${matchId}/tickets`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(
          data.data.sort((a: Ticket, b: Ticket) => a.category - b.category),
        );
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }, [matchId]);

  // Fetch seats when category is selected
  useEffect(() => {
    if (selectedCategory !== null) {
      const selectedTicket = tickets.find(
        (t) => t.category === selectedCategory,
      );
      if (selectedTicket) {
        fetch(
          `http://localhost:5000/api/matches/${matchId}/seats?ticketType=${selectedTicket.type}`,
        )
          .then((res) => res.json())
          .then((data) => {
            setSeats(data.data);
          })
          .catch((error) => console.error("Error fetching seats:", error));
      }
    }
  }, [matchId, selectedCategory, tickets]);

  const toggleSeat = (seat: Seat) => {
    const isSelected = selectedSeatsData.some((s) => s.id === seat.id);
    if (isSelected) {
      setSelectedSeatsData(selectedSeatsData.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeatsData([...selectedSeatsData, seat]);
    }
  };

  const isSeatSelected = (seatId: string) => {
    return selectedSeatsData.some((s) => s.id === seatId);
  };

  const totalPrice = selectedSeatsData.reduce((total, seat) => {
    return total + seat.ticket.price;
  }, 0);

  // Get category color classes
  const getCategoryColor = (category: number) => {
    const colors: Record<number, string> = {
      1: "bg-purple-500 hover:bg-purple-600 border-purple-400",
      2: "bg-blue-500 hover:bg-blue-600 border-blue-400",
      3: "bg-teal-500 hover:bg-teal-600 border-teal-400",
      4: "bg-yellow-500 hover:bg-yellow-600 border-yellow-400",
    };
    return colors[category] || "bg-gray-500";
  };

  const getCategoryBgColor = (category: number) => {
    const colors: Record<number, string> = {
      1: "bg-purple-500/20 border-purple-500/50",
      2: "bg-blue-500/20 border-blue-500/50",
      3: "bg-teal-500/20 border-teal-500/50",
      4: "bg-yellow-500/20 border-yellow-500/50",
    };
    return colors[category] || "bg-gray-500/20";
  };

  // Group seats by section for stadium view
  const groupedSeats = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.section]) acc[seat.section] = [];
      acc[seat.section].push(seat);
      return acc;
    },
    {} as Record<string, Seat[]>,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1A237E]/20 to-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1A237E]/20 to-[#0A0A0A] flex items-center justify-center">
        <p className="text-red-500 text-xl">Match not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1A237E]/20 to-[#0A0A0A]">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-[#FF6B35]/20 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => router.push("/")}
            className="text-[#FF6B35] hover:text-[#FFD700] mb-4 flex items-center gap-2 transition"
          >
            ← Back to Matches
          </button>
          <h1 className="text-4xl font-bebas tracking-wider bg-gradient-to-r from-[#FF6B35] via-[#FFD700] to-[#00BCD4] bg-clip-text text-transparent mb-2">
            {match.title}
          </h1>
          <p className="text-gray-400">{match.venue}</p>
          <p className="text-gray-500">
            {new Date(match.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-3xl font-bebas text-white mb-6 tracking-wider">
            🎫 SELECT TICKET CATEGORY
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedCategory(ticket.category)}
                className={`p-6 rounded-xl font-semibold transition-all duration-300 border-2 ${
                  selectedCategory === ticket.category
                    ? getCategoryColor(ticket.category) +
                      " text-white shadow-2xl scale-105"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full ${getCategoryColor(ticket.category)}`}
                    ></div>
                    <p className="text-xl font-bebas tracking-wider">
                      {ticket.type}
                    </p>
                  </div>
                  <p className="text-2xl font-bold">
                    ${ticket.price.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-80 mt-2">
                    {ticket.availableCount} seats available
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Oval Stadium View */}
        {selectedCategory !== null && (
          <div className="mb-8">
            <h2 className="text-3xl font-bebas text-white mb-6 tracking-wider">
              🏟️ STADIUM SEATING MAP
            </h2>

            {/* Legend */}
            <div className="flex gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-white/10 border-2 border-white/30"></div>
                <span className="text-white text-sm">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded ${getCategoryColor(selectedCategory)}`}
                ></div>
                <span className="text-white text-sm">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gray-600"></div>
                <span className="text-white text-sm">Unavailable</span>
              </div>
            </div>

            {/* Oval Stadium Container */}
            <div className="relative bg-gradient-to-br from-black/80 to-gray-900/80 rounded-3xl p-4 md:p-8 border-2 border-white/10 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                ></div>
              </div>

              {/* Stadium Oval - Using CSS to create oval shape */}
              <div
                className="relative w-full max-w-5xl mx-auto"
                style={{ aspectRatio: "1.4/1" }}
              >
                {/* Football Field - Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[60%] bg-gradient-to-br from-green-600 via-green-500 to-green-600 rounded-2xl shadow-2xl border-4 border-white/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-lg md:text-2xl font-bebas tracking-widest">
                      ⚽ FIELD ⚽
                    </p>
                  </div>
                  {/* Center Circle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white/30 rounded-full"></div>
                </div>

                {/* Seats in Oval Pattern - Arrange sections in a circle */}
                <div className="absolute inset-0">
                  {Object.entries(groupedSeats)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([section, sectionSeats], index, array) => {
                      // Calculate position in oval
                      const totalSections = array.length;
                      const angle =
                        (index / totalSections) * 2 * Math.PI - Math.PI / 2;
                      const radiusX = 45; // horizontal radius %
                      const radiusY = 42; // vertical radius %
                      const x = 50 + radiusX * Math.cos(angle);
                      const y = 50 + radiusY * Math.sin(angle);

                      return (
                        <div
                          key={section}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                          }}
                        >
                          {/* Section Label */}
                          <div className="text-center mb-2">
                            <span className="text-[#FFD700] font-bold text-xs md:text-sm px-2 py-1 bg-black/60 rounded-full border border-[#FFD700]/30">
                              {section}
                            </span>
                          </div>

                          {/* Seats in this section */}
                          <div className="grid grid-cols-2 gap-1 md:gap-2">
                            {sectionSeats
                              .sort((a, b) =>
                                a.seatNumber.localeCompare(b.seatNumber),
                              )
                              .slice(0, 6) // Show 6 seats per section for cleaner oval look
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                  disabled={seat.isBooked}
                                  className={`w-8 h-8 md:w-10 md:h-10 rounded text-[10px] md:text-xs font-bold transition-all duration-200 border-2 ${
                                    seat.isBooked
                                      ? "bg-gray-600 border-gray-700 cursor-not-allowed opacity-50"
                                      : isSeatSelected(seat.id)
                                        ? getCategoryColor(selectedCategory) +
                                          " scale-110 shadow-lg"
                                        : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105"
                                  }`}
                                  title={`${seat.seatNumber} - $${seat.ticket.price}`}
                                >
                                  {seat.seatNumber.split("-")[1] ||
                                    seat.seatNumber.slice(-2)}
                                </button>
                              ))}
                          </div>

                          {/* Availability indicator for this section */}
                          <div className="text-center mt-1">
                            <span className="text-[10px] text-white/60">
                              {sectionSeats.filter((s) => !s.isBooked).length}{" "}
                              left
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Availability Counter */}
              <div className="mt-8 text-center relative z-10">
                <p className="text-white text-base md:text-lg">
                  <span className="font-bold text-[#FFD700] text-xl md:text-2xl">
                    {seats.filter((s) => !s.isBooked).length}
                  </span>{" "}
                  <span className="text-white/80">
                    seats available in this category
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Seats Summary */}
        {selectedSeatsData.length > 0 && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl border-2 border-[#FF6B35]/30 shadow-2xl">
            <h3 className="text-2xl font-bebas text-white mb-6 tracking-wider">
              🎟️ SELECTED SEATS ({selectedSeatsData.length})
            </h3>

            <div className="max-h-48 overflow-y-auto space-y-3 mb-6">
              {selectedSeatsData.map((seat) => (
                <div
                  key={seat.id}
                  className="flex justify-between items-center text-white bg-white/5 p-3 rounded-lg"
                >
                  <span className="font-semibold">
                    {seat.section} - Seat {seat.seatNumber}
                  </span>
                  <span className="text-[#FFD700] font-bold">
                    ${seat.ticket.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-white/20 pt-6 mb-6">
              <div className="flex justify-between items-center text-white text-2xl font-bold">
                <span className="font-bebas tracking-wider">TOTAL</span>
                <span className="text-[#FFD700]">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const seatsData = selectedSeatsData.map((seat) => ({
                  id: seat.id,
                  seatNumber: seat.seatNumber,
                  section: seat.section,
                  price: seat.ticket.price,
                }));

                router.push(
                  `/checkout?seats=${encodeURIComponent(
                    JSON.stringify(seatsData),
                  )}&match=${encodeURIComponent(match.title)}`,
                );
              }}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-black py-4 rounded-xl font-bebas text-xl tracking-wider hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              PROCEED TO CHECKOUT →
            </button>
          </div>
        )}

        {/* Help Text */}
        {selectedCategory === null && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">
              👆 Select a ticket category above to view available seats
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
