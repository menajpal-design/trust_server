const mongoose = require('mongoose');
const geoHierarchySchema = require('../geo/geoHierarchy.model');

const committeeSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Committee name is required'],
      trim: true
    },
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    committee_level: {
      type: String,
      enum: ['CENTRAL', 'DIVISION', 'DISTRICT', 'UPAZILA', 'UNION', 'WARD', 'VILLAGE', 'SPECIALIZED'],
      default: 'CENTRAL'
    },
    committee_type: {
      type: String,
      enum: [
        'NATIONAL',
        'DIVISION',
        'DISTRICT',
        'UPAZILA',
        'UNION',
        'WARD',
        'VILLAGE',
        'SCHOOL',
        'COLLEGE',
        'MOSQUE',
        'MARKET',
        'WOMEN',
        'YOUTH',
        'EXECUTIVE',
        'SUB'
      ],
      default: 'EXECUTIVE',
      index: true
    },
    geo_location: geoHierarchySchema,
    description: {
      type: String,
      default: ''
    },
    parent_committee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Committee',
      default: null
    },
    duration_years: {
      type: Number,
      default: 2 // e.g. 2-year committee term
    },
    term_start_date: {
      type: Date,
      default: Date.now
    },
    term_end_date: {
      type: Date
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DISSOLVED', 'ARCHIVED'],
      default: 'ACTIVE'
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

committeeSchema.index({ organization_id: 1, is_deleted: 1, status: 1 });

module.exports = mongoose.model('Committee', committeeSchema);
