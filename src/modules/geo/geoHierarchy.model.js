const mongoose = require('mongoose');

const geoHierarchySchema = new mongoose.Schema(
  {
    division: {
      type: String,
      required: true,
      enum: ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'],
      index: true
    },
    district: {
      type: String,
      required: true,
      index: true
    },
    upazila: {
      type: String,
      required: true,
      index: true
    },
    municipality_city_corp: {
      type: String,
      default: ''
    },
    union_name: {
      type: String,
      default: ''
    },
    ward_no: {
      type: String,
      default: ''
    },
    village: {
      type: String,
      default: ''
    },
    mohalla: {
      type: String,
      default: ''
    },
    custom_area: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

module.exports = geoHierarchySchema;
