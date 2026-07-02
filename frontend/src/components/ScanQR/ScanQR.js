import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, CheckCircle, XCircle, ScanLine, Ticket as TicketIcon, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || '/api';

export default function ScanQR() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try { html5QrCodeRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  const startScanner = async () => {
    setScanning(true);
    setResult(null);
    setError(null);
    try {
      const Html5Qrcode = (await import('html5-qrcode')).Html5Qrcode;
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
      );
    } catch (err) {
      setError('Camera access denied or not available');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop(); } catch(e) {}
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    verifyTicket(decodedText);
  };

  const verifyTicket = async (qrData) => {
    try {
      setResult(null);
      setError(null);
      let ticketId = qrData;
      try {
        const parsed = JSON.parse(qrData);
        ticketId = parsed.ticketId || qrData;
      } catch(e) {}

      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/verify-ticket/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setResult(res.data.ticket);
        if (res.data.ticket.status === 'checked_in') {
          toast.error('This ticket has already been checked in');
        } else {
          toast.success('Valid ticket!');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid ticket';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleCheckIn = async () => {
    if (!result) return;
    try {
      const token = localStorage.getItem('token');
      const ticketsRes = await axios.get(`${API}/api/verify-ticket/${result.ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ticketId = ticketsRes.data.ticket._id;
      const res = await axios.put(`${API}/api/tickets/${ticketId}/checkin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Check-in successful!');
        setResult({ ...result, status: 'checked_in' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleManualVerify = () => {
    if (!manualInput.trim()) return;
    verifyTicket(manualInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(at_0%_0%,rgba(0,212,255,0.05)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(157,0,255,0.05)_0px,transparent_50%)]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-14 h-14 bg-[#00d4ff]/10 rounded-2xl flex items-center justify-center border border-[#00d4ff]/20">
            <ScanLine className="w-8 h-8 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">QR Scanner</h1>
            <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs mt-1">Ticket verification system</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl mb-8">
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <AnimatePresence mode="wait">
              {!scanning ? (
                <motion.button
                  key="start"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={startScanner}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#9d00ff] text-white rounded-2xl hover:brightness-110 transition font-bold shadow-lg shadow-[#00d4ff]/20"
                >
                  <Camera className="w-6 h-6" />
                  START SCANNER
                </motion.button>
              ) : (
                <motion.button
                  key="stop"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={stopScanner}
                  className="flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition font-bold"
                >
                  <CameraOff className="w-6 h-6" />
                  STOP SCANNER
                </motion.button>
              )}
            </AnimatePresence>

            <div
              id="qr-reader"
              className={`overflow-hidden rounded-2xl border-2 border-[#00d4ff]/30 shadow-2xl shadow-[#00d4ff]/10 ${scanning ? 'block' : 'hidden'}`}
              style={{ width: '100%', maxWidth: '400px' }}
            ></div>
          </div>

          {!scanning && !result && !error && (
            <div className="text-center py-16 bg-white/2 rounded-2xl border border-dashed border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <TicketIcon className="w-10 h-10 text-gray-700" />
              </div>
              <p className="text-gray-500 font-bold tracking-wide uppercase text-xs">Ready for scan</p>
              <p className="text-gray-600 text-sm mt-1">Use camera to verify attendee tickets</p>
            </div>
          )}

          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Manual Input</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00d4ff] transition" />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="ENTER TICKET ID..."
                  className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#00d4ff] focus:bg-white/10 outline-none transition text-white placeholder:text-gray-700 font-bold tracking-widest text-sm"
                />
              </div>
              <button
                onClick={handleManualVerify}
                className="px-8 py-4 bg-white text-black rounded-2xl hover:bg-gray-200 transition font-black text-sm tracking-widest"
              >
                VERIFY
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4 shadow-xl"
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-black text-red-500 uppercase tracking-widest text-xs mb-1">Error Occurred</p>
                <p className="text-white font-bold text-lg">{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                  result.status === 'checked_in'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-[#00ff88]/10 border-[#00ff88]/20'
                }`}>
                  {result.status === 'checked_in' ? (
                    <XCircle className="w-8 h-8 text-red-500" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-[#00ff88]" />
                  )}
                </div>
                <div>
                  <p className={`font-black uppercase tracking-widest text-xs mb-1 ${
                    result.status === 'checked_in' ? 'text-red-500' : 'text-[#00ff88]'
                  }`}>
                    {result.status === 'checked_in' ? 'Check-in Blocked' : 'Access Granted'}
                  </p>
                  <h2 className="text-2xl font-black text-white">
                    {result.status === 'checked_in' ? 'Already Used' : 'Valid Ticket'}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Ticket ID', value: result.ticketId },
                  { label: 'Event', value: result.event?.title },
                  { label: 'Attendee', value: result.attendeeName },
                  { label: 'Location', value: result.event?.venue }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">{item.label}</span>
                    <p className="text-white font-bold truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {result.status !== 'checked_in' && (
                <button
                  onClick={handleCheckIn}
                  className="w-full py-5 bg-[#00ff88] text-black rounded-2xl hover:brightness-110 transition font-black tracking-widest shadow-lg shadow-[#00ff88]/20"
                >
                  CONFIRM CHECK-IN
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
