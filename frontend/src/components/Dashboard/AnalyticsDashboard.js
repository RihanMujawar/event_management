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

const API = process.env.REACT_APP_API_URL || '/api';

const COLORS = ['#00d4ff', '#9d00ff', '#00ff88', '#ffb800', '#ff3366', '#ffffff'];

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
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4ff]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#00d4ff]/30 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1 font-medium">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-2 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg shadow-black/20`}>
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 text-xs mb-1 font-bold">{label}</p>
          <p className="text-[#00d4ff] font-black text-lg">
            {payload[0].name === 'revenue' ? `₹${payload[0].value}` : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(at_100%_0%,rgba(157,0,255,0.05)_0px,transparent_50%),radial-gradient(at_0%_100%,rgba(0,212,255,0.05)_0px,transparent_50%)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#00d4ff]/10 rounded-2xl flex items-center justify-center border border-[#00d4ff]/20">
              <Activity className="w-8 h-8 text-[#00d4ff]" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Dashboard</h1>
              <p className="text-gray-500 font-semibold uppercase tracking-widest text-xs mt-1">
                {user.role === 'admin' ? 'Platform Analytics' : 'Organizer Insights'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
          <StatCard icon={Calendar} label="Total Events" value={data.totalEvents} color="bg-gradient-to-br from-[#00d4ff] to-[#008fb3]" subtext={`${data.upcomingEvents} upcoming`} />
          <StatCard icon={Ticket} label="Tickets Sold" value={data.totalTicketsSold} color="bg-gradient-to-br from-[#9d00ff] to-[#6e00b3]" subtext={`${data.totalBookings} bookings`} />
          {user.role === 'admin' && (
            <StatCard icon={Users} label="Total Users" value={data.totalUsers} color="bg-gradient-to-br from-[#00ff88] to-[#00b360]" subtext={`${data.newUsersThisMonth} new`} />
          )}
          <StatCard icon={DollarSign} label="Total Revenue" value={`₹${(data.totalRevenue || 0).toLocaleString()}`} color="bg-gradient-to-br from-[#00d4ff] to-[#9d00ff]" />
          <StatCard icon={CheckCircle} label="Checked In" value={data.checkedIn} color="bg-gradient-to-br from-[#00ff88] to-[#00d4ff]" subtext={`${data.checkedInPercentage}% rate`} />
          <StatCard icon={TrendingUp} label="Avg Occupancy" value={`${data.totalBookingsPercentage}%`} color="bg-gradient-to-br from-[#ffb800] to-[#ff3366]" subtext={`${data.totalCapacity} capacity`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
               <span className="w-1.5 h-6 bg-[#00d4ff] rounded-full"></span>
               Monthly Bookings
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="bookings" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#9d00ff" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#00ff88] rounded-full"></span>
              Revenue Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#00ff88" strokeWidth={4} dot={{ fill: '#00ff88', r: 6, strokeWidth: 2, stroke: '#050505' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#9d00ff] rounded-full"></span>
              Category Distribution
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-4 w-full md:w-auto">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between gap-6 px-4 py-3 bg-white/5 border border-white/5 rounded-2xl min-w-[180px]">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm font-bold text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#ffb800] rounded-full"></span>
              Event Health
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest font-black text-[#00d4ff] mb-1">Upcoming</p>
                <p className="text-2xl font-black text-white">{data.upcomingEvents}</p>
              </div>
              <div className="p-4 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest font-black text-[#00ff88] mb-1">Active</p>
                <p className="text-2xl font-black text-white">{data.totalEvents - data.upcomingEvents - data.completedEvents}</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">Past</p>
                <p className="text-2xl font-black text-white">{data.completedEvents}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00d4ff]" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {(data.recentTickets || []).slice(0, 4).map(ticket => (
                <div key={ticket._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#9d00ff] rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg">
                      {ticket.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition">{ticket.user?.name || 'Unknown'}</p>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-tighter truncate max-w-[150px]">{ticket.event?.title}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-500 bg-white/5 px-3 py-1 rounded-full uppercase">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {(!data.recentTickets || data.recentTickets.length === 0) && (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-sm text-gray-500 font-medium italic">No recent bookings recorded</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
