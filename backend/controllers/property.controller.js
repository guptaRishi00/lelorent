import Property from "../models/property.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createProperty = async (req, res) => {
  try {
    const {
      title,
      location,
      monthlyRent,
      securityDeposit,
      maintenance,
      propertyType,
      furnishing,
      availableFrom,
      maxOccupancy,
      floor,
      facing,
      transportFacilities,
      amenities,
      educationFacilities,
      contactDetails,
      isPremium,
      premiumFeatures,
    } = req.body;

    const files = req.files;

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one property image is required" });
    }

    const uploadedImages = [];

    for (const file of files) {
      const cloudinaryResult = await uploadOnCloudinary(file.path);
      if (cloudinaryResult?.secure_url) {
        uploadedImages.push(cloudinaryResult.secure_url);
      } else {
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // ✅ Parse all JSON-stringified nested fields
    let parsedFloor,
      parsedTransport,
      parsedAmenities,
      parsedEducation,
      parsedContact,
      parsedPremium;
    try {
      parsedFloor = JSON.parse(floor);
      parsedTransport = JSON.parse(transportFacilities);
      parsedAmenities = JSON.parse(amenities);
      parsedEducation = JSON.parse(educationFacilities);
      parsedContact = contactDetails ? JSON.parse(contactDetails) : {};
      parsedPremium = JSON.parse(premiumFeatures);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid JSON in one of the fields" });
    }

    const newProperty = await Property.create({
      picture: uploadedImages,
      title,
      location,
      monthlyRent,
      securityDeposit,
      maintenance,
      propertyType,
      furnishing,
      availableFrom,
      maxOccupancy,
      floor: parsedFloor,
      facing,
      transportFacilities: parsedTransport,
      amenities: parsedAmenities,
      educationFacilities: parsedEducation,
      contactDetails: parsedContact,
      isPremium,
      premiumFeatures: parsedPremium,
    });

    res.status(201).json({ success: true, property: newProperty });
  } catch (error) {
    console.error("❌ Property creation failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const {
      title,
      location,
      monthlyRent,
      securityDeposit,
      maintenance,
      propertyType,
      furnishing,
      availableFrom,
      maxOccupancy,
      floor,
      facing,
      transportFacilities,
      amenities,
      educationFacilities,
      contactDetails,
      isPremium,
      premiumFeatures,
      existingImages,
    } = req.body;

    // Handle images: keep existing, add new
    let imagesToKeep = [];
    if (existingImages) {
      if (typeof existingImages === "string") {
        // If only one image, it may come as a string
        imagesToKeep = [existingImages];
      } else {
        imagesToKeep = existingImages;
      }
    }
    const files = req.files;
    let uploadedImages = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const cloudinaryResult = await uploadOnCloudinary(file.path);
        if (cloudinaryResult?.secure_url) {
          uploadedImages.push(cloudinaryResult.secure_url);
        } else {
          return res.status(500).json({ message: "Image upload failed" });
        }
      }
    }
    const finalImages = [...imagesToKeep, ...uploadedImages];
    if (finalImages.length === 0) {
      return res.status(400).json({ message: "At least one property image is required" });
    }

    // Parse JSON fields if present
    const parseIfString = (val) =>
      typeof val === "string" ? JSON.parse(val) : val;

    const updated = await Property.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(location && { location }),
        ...(monthlyRent && { monthlyRent }),
        ...(securityDeposit && { securityDeposit }),
        ...(maintenance && { maintenance }),
        ...(propertyType && { propertyType }),
        ...(furnishing && { furnishing }),
        ...(availableFrom && { availableFrom }),
        ...(maxOccupancy && { maxOccupancy }),
        ...(floor && { floor: parseIfString(floor) }),
        ...(facing && { facing }),
        ...(transportFacilities && {
          transportFacilities: parseIfString(transportFacilities),
        }),
        ...(amenities && { amenities: parseIfString(amenities) }),
        ...(educationFacilities && {
          educationFacilities: parseIfString(educationFacilities),
        }),
        ...(contactDetails && {
          contactDetails: parseIfString(contactDetails),
        }),
        ...(typeof isPremium !== "undefined" && { isPremium }),
        ...(premiumFeatures && {
          premiumFeatures: parseIfString(premiumFeatures),
        }),
        picture: finalImages,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, property: updated });
  } catch (err) {
    console.error("❌ Property update failed:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProperties = async (req, res) => {
  try {
    const { isPremium, location } = req.query;

    const query = {};
    if (isPremium !== undefined) query.isPremium = isPremium === "true";
    if (location) query.location = new RegExp(location, "i");

    const properties = await Property.find(query);
    res.status(200).json({ success: true, properties });
  } catch (error) {
    console.error("❌ Failed to get properties:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Property.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ success: true, message: "Property deleted" });
  } catch (err) {
    console.error("❌ Property delete failed:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};
