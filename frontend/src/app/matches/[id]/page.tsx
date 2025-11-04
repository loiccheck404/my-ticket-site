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
}

interface Seat {
  id: string;
  seatNumber: string;
  row: string;
  section: string;
  ticket: {
    price: number;
  };
}

export default function MatchDetails() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
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
        setTickets(data.data);
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }, [matchId]);

  // Fetch seats when ticket type is selected
  useEffect(() => {
    if (selectedTicketType) {
      fetch(
        `http://localhost:5000/api/matches/${matchId}/seats?ticketType=${selectedTicketType}`
      )
        .then((res) => res.json())
        .then((data) => {
          setSeats(data.data);
        })
        .catch((error) => console.error("Error fetching seats:", error));
    }
  }, [matchId, selectedTicketType]);

  // Toggle seat selection
  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Calculate total price
  const totalPrice = selectedSeats.reduce((total, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    return total + (seat?.ticket.price || 0);
  }, 0);

  // Group seats by row
  const groupedSeats = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-yellow-500 text-xl">Loading...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-500 text-xl">Match not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-yellow-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => router.push("/")}
            className="text-yellow-500 hover:text-yellow-400 mb-4 flex items-center"
          >
            ← Back to Matches
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">{match.title}</h1>
          <p className="text-gray-400">{match.venue}</p>
          <p className="text-gray-500">
            {new Date(match.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Ticket Type Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Select Ticket Type
          </h2>
          <div className="flex gap-4">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => {
                  setSelectedTicketType(ticket.type);
                  setSelectedSeats([]); // Clear selections when changing type
                }}
                className={`px-6 py-4 rounded-lg font-semibold transition ${
                  selectedTicketType === ticket.type
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                <div className="text-left">
                  <p className="text-lg">{ticket.type}</p>
                  <p className="text-sm opacity-80">${ticket.price}</p>
                  <p className="text-xs opacity-60">
                    {ticket.availableCount} available
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Seat Selection Grid */}
        {selectedTicketType && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Select Your Seats
            </h2>
            <div className="bg-gray-900 p-6 rounded-lg">
              {/* Stage/Field indicator */}
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-500 text-center py-2 mb-6 rounded">
                FIELD
              </div>

              {/* Seat Grid */}
              <div className="space-y-4">
                {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center gap-2">
                    <span className="text-yellow-500 font-bold w-8">{row}</span>
                    <div className="flex gap-2 flex-wrap">
                      {rowSeats.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => toggleSeat(seat.id)}
                          className={`w-10 h-10 rounded text-xs font-semibold transition ${
                            selectedSeats.includes(seat.id)
                              ? "bg-yellow-500 text-black"
                              : "bg-gray-700 text-white hover:bg-gray-600"
                          }`}
                        >
                          {seat.seatNumber.slice(-1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Seats Summary */}
        {selectedSeats.length > 0 && (
          <div className="bg-gray-900 p-6 rounded-lg border border-yellow-500/20">
            <h3 className="text-xl font-bold text-white mb-4">
              Selected Seats
            </h3>
            <div className="space-y-2 mb-4">
              {selectedSeats.map((seatId) => {
                const seat = seats.find((s) => s.id === seatId);
                return seat ? (
                  <div
                    key={seatId}
                    className="flex justify-between text-gray-300"
                  >
                    <span>
                      Seat {seat.seatNumber} ({seat.section})
                    </span>
                    <span className="text-yellow-500">
                      ${seat.ticket.price}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
            <div className="border-t border-gray-700 pt-4 mb-4">
              <div className="flex justify-between text-white text-xl font-bold">
                <span>Total</span>
                <span className="text-yellow-500">${totalPrice}</span>
              </div>
            </div>
            <button className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
