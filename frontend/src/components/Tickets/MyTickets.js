import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar, MapPin, Clock, ChevronDown, ChevronUp, QrCode } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || '/api';

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
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(at_0%_0%,rgba(0,212,255,0.05)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(157,0,255,0.05)_0px,transparent_50%)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 bg-[#00d4ff]/10 rounded-2xl flex items-center justify-center border border-[#00d4ff]/20 shadow-lg shadow-[#00d4ff]/10">
            <Ticket className="w-8 h-8 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">My Tickets</h1>
            <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs mt-1">Your personal collection</p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
          >
            <Ticket className="w-20 h-20 text-white/10 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No tickets found</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">You haven't booked any events yet. Your digital passes will appear here.</p>
            <button
              onClick={() => window.location.href = '/events'}
              className="px-8 py-3 bg-gradient-to-r from-[#00d4ff] to-[#9d00ff] text-white rounded-xl font-bold hover:brightness-110 transition shadow-lg shadow-[#00d4ff]/20"
            >
              Explore Events
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl hover:border-white/20 transition-all group"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
                          ticket.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' :
                          ticket.status === 'checked_in' ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20' :
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">ID: {ticket.ticketId}</span>
                      </div>

                      <h3 className="text-2xl font-black text-white mb-4 group-hover:text-[#00d4ff] transition-colors">{ticket.event?.title}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-[#00d4ff]" />
                          </div>
                          <span className="text-sm font-bold">{ticket.event?.date ? new Date(ticket.event.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#00d4ff]" />
                          </div>
                          <span className="text-sm font-bold">{ticket.event?.time || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-[#00d4ff]" />
                          </div>
                          <span className="text-sm font-bold truncate max-w-[150px]">{ticket.event?.venue || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowQR(showQR === ticket._id ? null : ticket._id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${
                          showQR === ticket._id
                          ? 'bg-white text-black'
                          : 'bg-[#00d4ff] text-black hover:brightness-110 shadow-lg shadow-[#00d4ff]/20'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        {showQR === ticket._id ? 'Close' : 'View Pass'}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showQR === ticket._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center">
                          <div className="bg-white p-6 rounded-[2rem] shadow-2xl shadow-black">
                            <QRCodeSVG
                              value={ticket.qrData || ticket.ticketId}
                              size={200}
                              level="H"
                              includeMargin
                            />
                          </div>
                          <div className="mt-6 text-center">
                            <p className="text-xs font-black text-[#00d4ff] uppercase tracking-[0.2em] mb-1">Digital Entry Pass</p>
                            <p className="text-xs text-gray-500 font-medium italic">Present this code at the venue check-in desk</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                    className="mt-8 flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                  >
                    {expandedTicket === ticket._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Order Details
                  </button>

                  <AnimatePresence>
                    {expandedTicket === ticket._id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 rounded-2xl p-6 border border-white/5"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Pass ID</span>
                          <p className="text-sm font-bold text-white font-mono truncate">{ticket.ticketId}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Quantity</span>
                          <p className="text-sm font-bold text-white">{ticket.quantity} Person(s)</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Paid</span>
                          <p className="text-sm font-bold text-[#00ff88]">₹{ticket.totalPaid}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Issued On</span>
                          <p className="text-sm font-bold text-white">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
