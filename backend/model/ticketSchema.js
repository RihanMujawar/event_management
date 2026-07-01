const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendeeName: {
        type: String,
        required: true
    },
    attendeeEmail: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    totalPaid: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'checked_in', 'cancelled', 'refunded'],
        default: 'active'
    },
    checkedInAt: {
        type: Date
    },
    checkedInBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentId: {
        type: String
    },
    qrData: {
        type: String
    }
}, {
    timestamps: true
});

ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ ticketId: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
