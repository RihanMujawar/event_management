import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, CheckCircle, XCircle, ScanLine } from 'lucide-react';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ScanLine className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
              >
                <CameraOff className="w-5 h-5" />
                Stop Camera
              </button>
            )}
          </div>

          <div id="qr-reader" className={`mx-auto ${scanning ? '' : 'hidden'}`} style={{ maxWidth: '400px' }}></div>

          {!scanning && !result && !error && (
            <div className="text-center py-12 text-gray-400">
              <ScanLine className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Point your camera at a QR code to scan</p>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">or enter manually</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter Ticket ID (e.g., TKT-XXXXXXXX)"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleManualVerify}
                className="px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition font-medium"
              >
                Verify
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Invalid Ticket</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                {result.status === 'checked_in' ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <span className={`font-medium ${result.status === 'checked_in' ? 'text-red-700' : 'text-green-700'}`}>
                  {result.status === 'checked_in' ? 'Already Checked In' : 'Valid Ticket'}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-400">Ticket ID</span>
                  <span className="font-medium text-gray-700">{result.ticketId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-400">Event</span>
                  <span className="font-medium text-gray-700">{result.event?.title}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-400">Date</span>
                  <span className="font-medium text-gray-700">
                    {result.event?.date ? new Date(result.event.date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-400">Venue</span>
                  <span className="font-medium text-gray-700">{result.event?.venue}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Attendee</span>
                  <span className="font-medium text-gray-700">{result.attendeeName}</span>
                </div>
              </div>

              {result.status !== 'checked_in' && (
                <button
                  onClick={handleCheckIn}
                  className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium"
                >
                  Confirm Check-In
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
