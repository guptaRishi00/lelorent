import Property from "../models/property.model.js";

export const createProperty = async (req, res) => {
  try {
    const newProperty = await Property.create(req.body);
    res.status(201).json({ success: true, property: newProperty });
  } catch (error) {
    console.error("❌ Property creation failed:", error);
    res.status(400).json({ success: false, message: error.message });
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
