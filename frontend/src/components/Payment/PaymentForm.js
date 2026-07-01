import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, CheckCircle, ArrowLeft, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No event selected</h2>
          <button onClick={() => navigate('/events')} className="text-blue-600 hover:underline">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-6">
            {quantity} ticket{quantity > 1 ? 's' : ''} booked for {eventData.title}
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Event</span>
              <span className="font-medium">{eventData.title}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Quantity</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Paid</span>
              <span className="font-bold text-green-600">₹{totalAmount}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/my-tickets')}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
            >
              View Tickets
            </button>
            <button
              onClick={() => navigate('/events')}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
            >
              Browse More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
              </div>

              <AnimatePresence mode="wait">
                {step === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700">{eventData.title}</h3>
                        <span className="text-lg font-bold text-gray-900">₹{eventData.price}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-500">Quantity:</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="w-10 sm:w-8 text-center font-medium">{quantity}</span>
                          <button
                            onClick={() => setQuantity(Math.min(availableSpots, quantity + 1))}
                            className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-gray-400">({availableSpots} available)</span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                        <span className="font-semibold text-gray-700">Total</span>
                        <span className="font-bold text-lg text-gray-900">₹{totalAmount}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep('card')}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
                    >
                      Proceed to Payment
                    </button>
                  </motion.div>
                )}

                {step === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-6">
                        <div className="flex justify-between items-start mb-8">
                          <CreditCard className="w-8 h-8" />
                          <Lock className="w-5 h-5 opacity-70" />
                        </div>
                        <p className="text-lg font-mono tracking-wider mb-4">
                          {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                        </p>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-blue-200 text-xs">Card Holder</p>
                            <p className="font-medium">{cardDetails.cardName || 'Your Name'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-200 text-xs">Expires</p>
                            <p className="font-medium">{cardDetails.expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) => handleCardChange('cardNumber', e.target.value)}
                            placeholder="4242 4242 4242 4242"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardDetails.cardName}
                            onChange={(e) => handleCardChange('cardName', e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={(e) => handleCardChange('expiry', e.target.value)}
                              placeholder="MM/YY"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              type="text"
                              value={cardDetails.cvv}
                              onChange={(e) => handleCardChange('cvv', e.target.value)}
                              placeholder="•••"
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('review')}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Pay ₹{totalAmount}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                {eventData.image && (
                  <img src={eventData.image} alt={eventData.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Event</span>
                  <span className="font-medium text-right">{eventData.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date</span>
                  <span className="font-medium">{new Date(eventData.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Venue</span>
                  <span className="font-medium">{eventData.venue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price per ticket</span>
                  <span className="font-medium">₹{eventData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
