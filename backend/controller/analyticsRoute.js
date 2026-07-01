const express = require('express');
const router = express.Router();
const Event = require('../model/eventSchema');
const Ticket = require('../model/ticketSchema');
const User = require('../model/userSchema');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const { role, userId } = req.user;
        let matchStage = {};

        if (role === 'organizer') {
            matchStage = { createdBy: req.user.userId };
        }

        const events = await Event.find(matchStage).sort({ date: 1 });
        const eventIds = events.map(e => e._id);

        const totalEvents = events.length;
        const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
        const totalBookings = events.reduce((sum, e) => sum + e.bookedBy.length, 0);
        const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
        const completedEvents = events.filter(e => new Date(e.date) < new Date()).length;

        const tickets = await Ticket.find({ event: { $in: eventIds } });
        const totalRevenue = tickets.reduce((sum, t) => sum + t.totalPaid, 0);
        const totalTicketsSold = tickets.length;
        const checkedIn = tickets.filter(t => t.status === 'checked_in').length;

        const categoryBreakdown = events.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + 1;
            return acc;
        }, {});

        const monthlyBookings = await Ticket.aggregate([
            { $match: { event: { $in: eventIds } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalPaid' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const recentTickets = await Ticket.find({ event: { $in: eventIds } })
            .populate('user', 'name email')
            .populate('event', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

        let totalUsers = 0;
        let newUsersThisMonth = 0;
        if (role === 'admin') {
            totalUsers = await User.countDocuments();
            const firstOfMonth = new Date();
            firstOfMonth.setDate(1);
            firstOfMonth.setHours(0, 0, 0, 0);
            newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: firstOfMonth } });
        }

        res.json({
            success: true,
            analytics: {
                totalEvents,
                totalCapacity,
                totalBookings,
                totalBookingsPercentage: totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0,
                upcomingEvents,
                completedEvents,
                totalRevenue,
                totalTicketsSold,
                checkedIn,
                checkedInPercentage: totalTicketsSold > 0 ? Math.round((checkedIn / totalTicketsSold) * 100) : 0,
                categoryBreakdown,
                monthlyBookings,
                recentTickets,
                totalUsers,
                newUsersThisMonth
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

router.get('/events', authenticateToken, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'organizer') {
            filter.createdBy = req.user.userId;
        }
        const events = await Event.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

module.exports = router;
