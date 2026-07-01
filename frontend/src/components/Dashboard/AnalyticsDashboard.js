import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  Calendar, Users, Ticket, DollarSign, TrendingUp, Activity,
  CheckCircle, Clock
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const COLORS = ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.analytics);
    } catch (err) {
      console.error('Analytics error:', err);
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

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const categoryData = Object.entries(data.categoryBreakdown || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const monthlyData = (data.monthlyBookings || []).map(item => ({
    month: new Date(2024, item._id - 1).toLocaleString('default', { month: 'short' }),
    bookings: item.count,
    revenue: item.revenue
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-400">
                {user.role === 'admin' ? 'Platform Overview' : 'Your Event Overview'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar} label="Total Events" value={data.totalEvents} color="bg-blue-500" subtext={`${data.upcomingEvents} upcoming`} />
          <StatCard icon={Ticket} label="Tickets Sold" value={data.totalTicketsSold} color="bg-purple-500" subtext={`${data.totalBookings} bookings`} />
          {user.role === 'admin' && (
            <StatCard icon={Users} label="Total Users" value={data.totalUsers} color="bg-green-500" subtext={`${data.newUsersThisMonth} new this month`} />
          )}
          <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString()}`} color="bg-emerald-500" />
          <StatCard icon={CheckCircle} label="Checked In" value={data.checkedIn} color="bg-teal-500" subtext={`${data.checkedInPercentage}% check-in rate`} />
          <StatCard icon={TrendingUp} label="Avg Occupancy" value={`${data.totalBookingsPercentage}%`} color="bg-orange-500" subtext={`${data.totalCapacity} total capacity`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Bookings</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#2ecc71" strokeWidth={2} dot={{ fill: '#2ecc71' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Events by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-blue-700">Upcoming Events</span>
                </div>
                <span className="text-xl font-bold text-blue-700">{data.upcomingEvents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-700">Ongoing Events</span>
                </div>
                <span className="text-xl font-bold text-green-700">{data.totalEvents - data.upcomingEvents - data.completedEvents}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">Completed Events</span>
                </div>
                <span className="text-xl font-bold text-gray-700">{data.completedEvents}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Recent Bookings</h3>
            <div className="space-y-3">
              {(data.recentTickets || []).slice(0, 5).map(ticket => (
                <div key={ticket._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{ticket.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{ticket.event?.title}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {(!data.recentTickets || data.recentTickets.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No recent bookings</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
