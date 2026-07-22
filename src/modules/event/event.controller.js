const EventService = require('./event.service');
const ApiResponse = require('../../utils/apiResponse');

class EventController {
  static async create(req, res) {
    const result = await EventService.createEvent(req.user.active_organization_id, req.body);
    return ApiResponse.success(res, 'Event created successfully', result, 201);
  }

  static async list(req, res) {
    const result = await EventService.getEvents(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Events retrieved', result, 200);
  }

  static async register(req, res) {
    const result = await EventService.registerForEvent(
      req.user.active_organization_id,
      req.user._id,
      req.params.id
    );
    return ApiResponse.success(res, 'Registered for event', result, 201);
  }

  static async checkIn(req, res) {
    const result = await EventService.checkInAttendee(
      req.user.active_organization_id,
      req.body.ticket_code
    );
    return ApiResponse.success(res, 'QR Ticket Check-In Successful', result, 200);
  }

  static async getAttendees(req, res) {
    const result = await EventService.getEventAttendees(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, 'Attendees list retrieved', result, 200);
  }
}

module.exports = EventController;
