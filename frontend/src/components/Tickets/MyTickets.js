import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(res.data.tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Ticket className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No tickets yet</h2>
            <p className="text-gray-400">Book an event to see your tickets here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{ticket.ticketId}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{ticket.event?.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {ticket.event?.time || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {ticket.event?.venue || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowQR(showQR === ticket._id ? null : ticket._id)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      {showQR === ticket._id ? 'Hide QR' : 'Show QR'}
                    </button>
                  </div>

                  {showQR === ticket._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-gray-100"
                    >
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-blue-100">
                          <QRCodeSVG
                            value={ticket.qrData || ticket.ticketId}
                            size={200}
                            level="H"
                            includeMargin
                          />
                        </div>
                        <p className="mt-3 text-sm text-gray-500">Show this QR code at the venue</p>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                    className="mt-4 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition"
                  >
                    {expandedTicket === ticket._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Details
                  </button>

                  {expandedTicket === ticket._id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-4"
                    >
                      <div>
                        <span className="text-gray-400">Ticket ID</span>
                        <p className="font-medium text-gray-700">{ticket.ticketId}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Quantity</span>
                        <p className="font-medium text-gray-700">{ticket.quantity}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Total Paid</span>
                        <p className="font-medium text-gray-700">₹{ticket.totalPaid}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Booked On</span>
                        <p className="font-medium text-gray-700">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
