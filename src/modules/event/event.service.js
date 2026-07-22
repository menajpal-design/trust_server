const crypto = require('crypto');
const QRCode = require('qrcode');
const Event = require('./event.model');
const Attendance = require('./attendance.model');

class EventService {
  static async createEvent(organizationId, data) {
    return await Event.create({
      ...data,
      organization_id: organizationId
    });
  }

  static async getEvents(organizationId, { status }) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (status) query.status = status;
    return await Event.find(query).sort({ start_time: 1 });
  }

  static async registerForEvent(organizationId, userId, eventId) {
    const event = await Event.findById(eventId);
    if (!event || event.is_deleted) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    const existing = await Attendance.findOne({ event_id: eventId, user_id: userId });
    if (existing) return existing;

    const ticketCode = `TCK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({ ticket_code: ticketCode, event_id: eventId }), { errorCorrectionLevel: 'H' });

    return await Attendance.create({
      organization_id: organizationId,
      event_id: eventId,
      user_id: userId,
      ticket_code: ticketCode,
      qr_code_data: qrCodeData,
      check_in_status: 'REGISTERED'
    });
  }

  static async checkInAttendee(organizationId, ticketCode) {
    const record = await Attendance.findOne({
      organization_id: organizationId,
      ticket_code: ticketCode
    }).populate('user_id', 'first_name last_name email').populate('event_id', 'title');

    if (!record) {
      const error = new Error('Invalid ticket QR code');
      error.statusCode = 404;
      throw error;
    }

    record.check_in_status = 'PRESENT';
    record.checked_in_at = new Date();
    await record.save();

    return record;
  }

  static async getEventAttendees(organizationId, eventId) {
    return await Attendance.find({
      organization_id: organizationId,
      event_id: eventId,
      is_deleted: false
    }).populate('user_id', 'first_name last_name email avatar_url');
  }
}

module.exports = EventService;
