import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || '/api';

export default function PaymentForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const eventData = location.state?.event;

  const [step, setStep] = useState('review');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No event selected</h2>
          <button onClick={() => navigate('/events')} className="text-[#00d4ff] hover:underline">
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = eventData.price * quantity;
  const availableSpots = eventData.capacity - (eventData.bookedBy?.length || 0);

  const handleCardChange = (field, value) => {
    let formatted = value;
    if (field === 'cardNumber') {
      formatted = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
    }
    if (field === 'expiry') {
      formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }
    if (field === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardDetails(prev => ({ ...prev, [field]: formatted }));
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const intentRes = await axios.post(`${API}/api/create-payment-intent`, {
        eventId: eventData._id,
        quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!intentRes.data.success) {
        throw new Error('Failed to create payment');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      await axios.post(`${API}/api/confirm-payment`, {
        eventId: eventData._id,
        quantity,
        paymentIntentId: intentRes.data.paymentIntentId,
        cardDetails: {
          last4: cardDetails.cardNumber.slice(-4),
          cardholderName: cardDetails.cardName
        },
        attendeeName: JSON.parse(localStorage.getItem('user') || '{}').name || 'Attendee',
        attendeeEmail: JSON.parse(localStorage.getItem('user') || '{}').email || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentComplete(true);
      toast.success('Payment successful! Tickets booked.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
          <p className="text-gray-400 mb-8">
            {quantity} ticket{quantity > 1 ? 's' : ''} booked for {eventData.title}
          </p>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 text-left text-sm backdrop-blur-md">
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Event</span>
              <span className="font-semibold text-white">{eventData.title}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">Quantity</span>
              <span className="font-semibold text-white">{quantity}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-white/5">
              <span className="text-gray-500">Total Paid</span>
              <span className="font-bold text-xl text-[#00ff88]">₹{totalAmount}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/my-tickets')}
              className="w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#9d00ff] text-white rounded-2xl hover:brightness-110 transition font-bold shadow-lg shadow-[#00d4ff]/20"
            >
              View Tickets
            </button>
            <button
              onClick={() => navigate('/events')}
              className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl hover:bg-white/10 transition font-semibold"
            >
              Browse More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(at_0%_0%,rgba(0,212,255,0.05)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(157,0,255,0.05)_0px,transparent_50%)]">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#00d4ff]/10 rounded-xl flex items-center justify-center border border-[#00d4ff]/20">
                  <CreditCard className="w-6 h-6 text-[#00d4ff]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Payment</h2>
              </div>

              <AnimatePresence mode="wait">
                {step === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl text-white">{eventData.title}</h3>
                        <span className="text-2xl font-black text-white">₹{eventData.price}</span>
                      </div>
                      <div className="flex items-center justify-between py-4 border-t border-white/5">
                        <label className="text-gray-400 font-medium">Quantity</label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition text-white"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-xl text-white">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(availableSpots, quantity + 1))}
                            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-right text-xs text-[#00d4ff] mt-2">{availableSpots} spots available</p>
                    </div>
                    <div className="flex justify-between items-center mb-8 px-2">
                      <span className="text-gray-400 font-semibold">Total Amount</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9d00ff]">₹{totalAmount}</span>
                    </div>
                    <button
                      onClick={() => setStep('card')}
                      className="w-full py-4 bg-gradient-to-r from-[#00d4ff] to-[#9d00ff] text-white rounded-2xl hover:brightness-110 transition font-bold shadow-lg shadow-[#00d4ff]/20"
                    >
                      Proceed to Checkout
                    </button>
                  </motion.div>
                )}

                {step === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="mb-8">
                      <div className="bg-gradient-to-br from-[#00d4ff] to-[#9d00ff] rounded-2xl p-8 text-white mb-8 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                        <div className="flex justify-between items-start mb-12 relative z-10">
                          <CreditCard className="w-10 h-10" />
                          <Lock className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="text-2xl font-mono tracking-[0.2em] mb-8 relative z-10">
                          {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex justify-between text-sm relative z-10">
                          <div>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Card Holder</p>
                            <p className="font-bold tracking-wide">{cardDetails.cardName || 'YOUR NAME'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Expires</p>
                            <p className="font-bold">{cardDetails.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-400 mb-2 group-focus-within:text-[#00d4ff] transition">Card Number</label>
                          <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                            placeholder="4242 4242 4242 4242"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#00d4ff] focus:bg-white/10 outline-none transition text-white placeholder:text-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-400 mb-2">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardDetails.cardName}
                            onChange={(e) => handleCardChange('cardName', e.target.value)}
                            placeholder="JOHN DOE"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#00d4ff] focus:bg-white/10 outline-none transition text-white placeholder:text-gray-600 uppercase"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Expiry Date</label>
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={(e) => handleCardChange('expiry', e.target.value)}
                              placeholder="MM/YY"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#00d4ff] focus:bg-white/10 outline-none transition text-white placeholder:text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">CVV</label>
                            <input
                              type="password"
                              value={cardDetails.cvv}
                              onChange={(e) => handleCardChange('cvv', e.target.value)}
                              placeholder="•••"
                              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-[#00d4ff] focus:bg-white/10 outline-none transition text-white placeholder:text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep('review')}
                        className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition font-bold"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="flex-1 py-4 bg-[#00ff88] text-black rounded-2xl hover:brightness-110 transition font-black disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-[#00ff88]/20"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            PROCESSING...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            PAY ₹{totalAmount}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl sticky top-32">
              <h3 className="font-bold text-xl text-white mb-8 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-[#9d00ff] rounded-full"></span>
                Summary
              </h3>
              <div className="space-y-6">
                {eventData.image && (
                  <img src={eventData.image} alt={eventData.title} className="w-full h-40 object-cover rounded-2xl mb-4 border border-white/10" />
                )}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-gray-500 font-medium">Event</span>
                    <span className="font-bold text-white text-right">{eventData.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Date</span>
                    <span className="font-semibold text-white">{new Date(eventData.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Venue</span>
                    <span className="font-semibold text-white">{eventData.venue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Ticket Price</span>
                    <span className="font-semibold text-white">₹{eventData.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Quantity</span>
                    <span className="font-semibold text-white">{quantity}</span>
                  </div>
                  <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-white text-lg">Total</span>
                    <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#9d00ff]">₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
