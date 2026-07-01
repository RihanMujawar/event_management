const express = require('express');
const router = express.Router();
const Ticket = require('../model/ticketSchema');
const Event = require('../model/eventSchema');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

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

const authorizeAdminOrOrganizer = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
        return res.status(403).json({ message: 'Admin or Organizer access required' });
    }
    next();
};

router.post('/create-payment-intent', authenticateToken, async (req, res) => {
    try {
        const { eventId, quantity } = req.body;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const totalAmount = event.price * quantity;
        const availableSpots = event.capacity - event.bookedBy.length;
        if (quantity > availableSpots) {
            return res.status(400).json({ message: 'Not enough available spots' });
        }

        res.json({
            success: true,
            amount: totalAmount,
            currency: 'INR',
            paymentIntentId: `pi_fake_${uuidv4().slice(0, 8)}`
        });
    } catch (error) {
        console.error('Payment intent error:', error);
        res.status(500).json({ message: 'Error creating payment' });
    }
});

router.post('/confirm-payment', authenticateToken, async (req, res) => {
    try {
        const { eventId, quantity, paymentIntentId, cardDetails } = req.body;
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const totalAmount = event.price * quantity;
        const availableSpots = event.capacity - event.bookedBy.length;
        if (quantity > availableSpots) {
            return res.status(400).json({ message: 'Not enough available spots' });
        }

        if (event.bookedBy.includes(req.user.userId)) {
            return res.status(400).json({ message: 'You have already booked this event' });
        }

        for (let i = 0; i < quantity; i++) {
            const ticketId = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
            const ticket = new Ticket({
                ticketId,
                event: eventId,
                user: req.user.userId,
                attendeeName: req.body.attendeeName || 'Attendee',
                attendeeEmail: req.body.attendeeEmail || 'email@example.com',
                quantity: 1,
                totalPaid: event.price,
                paymentId: paymentIntentId,
                qrData: JSON.stringify({
                    ticketId,
                    eventId,
                    userId: req.user.userId,
                    eventTitle: event.title,
                    eventDate: event.date,
                    scanned: false
                })
            });
            await ticket.save();
            event.bookedBy.push(req.user.userId);
        }

        await event.save();

        res.json({
            success: true,
            message: 'Payment successful and tickets booked',
            tickets: quantity
        });
    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.status(500).json({ message: 'Error confirming payment' });
    }
});

router.get('/tickets', authenticateToken, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user.userId })
            .populate('event', 'title date time venue image')
            .sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Error fetching tickets' });
    }
});

router.get('/tickets/:id', authenticateToken, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('event', 'title date time venue image')
            .populate('user', 'name email');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (ticket.user._id.toString() !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'organizer') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json({ success: true, ticket });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Error fetching ticket' });
    }
});

router.get('/event/:eventId/tickets', authenticateToken, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        const tickets = await Ticket.find({ event: req.params.eventId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching event tickets:', error);
        res.status(500).json({ message: 'Error fetching tickets' });
    }
});

router.put('/tickets/:id/checkin', authenticateToken, authorizeAdminOrOrganizer, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (ticket.status === 'checked_in') {
            return res.status(400).json({ message: 'Already checked in' });
        }
        ticket.status = 'checked_in';
        ticket.checkedInAt = new Date();
        ticket.checkedInBy = req.user.userId;
        await ticket.save();
        res.json({ success: true, message: 'Check-in successful', ticket });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Error during check-in' });
    }
});

router.get('/verify-ticket/:ticketId', async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketId: req.params.ticketId })
            .populate('event', 'title date time venue')
            .populate('user', 'name email');
        if (!ticket) return res.status(404).json({ message: 'Invalid ticket' });
        res.json({
            success: true,
            ticket: {
                _id: ticket._id,
                ticketId: ticket.ticketId,
                status: ticket.status,
                event: ticket.event,
                attendeeName: ticket.attendeeName,
                attendeeEmail: ticket.attendeeEmail
            }
        });
    } catch (error) {
        console.error('Verify ticket error:', error);
        res.status(500).json({ message: 'Error verifying ticket' });
    }
});

module.exports = router;
