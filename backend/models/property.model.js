import mongoose from "mongoose";

const { Schema } = mongoose;

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    monthlyRent: {
      type: Number,
      required: [true, "Monthly rent is required"],
      min: [0, "Rent cannot be negative"],
    },
    securityDeposit: {
      type: Number,
      required: [true, "Security deposit is required"],
      min: [0, "Deposit cannot be negative"],
    },
    maintenance: {
      type: Number,
      default: 0,
      min: 0,
    },
    propertyType: {
      type: String,
      required: [true, "Property type is required"],
      enum: ["1BHK", "2BHK", "3BHK", "Studio", "Independent House"],
    },
    furnishing: {
      type: String,
      required: [true, "Furnishing status is required"],
      enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
    },
    availableFrom: {
      type: Date,
      required: [true, "Available date is required"],
    },
    maxOccupancy: {
      type: Number,
      required: [true, "Max occupancy is required"],
      min: [1, "At least 1 occupant required"],
    },
    floor: {
      number: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 1 },
    },
    facing: {
      type: String,
      required: true,
      enum: [
        "North",
        "South",
        "East",
        "West",
        "North-East",
        "North-West",
        "South-East",
        "South-West",
      ],
    },

    transportFacilities: [
      {
        type: {
          type: String,
          required: true,
          enum: ["MetroStation", "RailwayStation", "BusStop", "Airport"],
        },
        distance: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    amenities: [
      {
        type: {
          type: String,
          required: true,
          enum: ["Grocery", "MedicalStore", "Hospital", "Restaurants"],
        },
        distance: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    educationFacilities: [
      {
        type: {
          type: String,
          required: true,
          enum: ["School", "College"],
        },
        distance: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumFeatures: {
      exactLocation: { type: Boolean, default: false },
      ownerContact: { type: Boolean, default: false },
      directVisits: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals for formatted output
propertySchema.virtual("formattedRent").get(function () {
  return `₹${this.monthlyRent.toLocaleString("en-IN")}/month`;
});

propertySchema.virtual("formattedDeposit").get(function () {
  return `₹${this.securityDeposit.toLocaleString("en-IN")}`;
});

// Compound index for better query performance
propertySchema.index({ location: 1, monthlyRent: 1, propertyType: 1 });

// Export the model
const Property = mongoose.model("Property", propertySchema);
export default Property;
