import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export const usePropertyUpload = () => {
  const { getToken } = useAuth();

  const uploadProperty = async (propertyForm) => {
    const formData = new FormData();

    // Append images
    propertyForm.images?.forEach((file) => {
      formData.append("pictures", file);
    });

    // Append all string/numeric fields
    formData.append("title", propertyForm.title);
    formData.append("location", propertyForm.location);
    formData.append("monthlyRent", propertyForm.monthlyRent);
    formData.append("securityDeposit", propertyForm.securityDeposit);
    formData.append("maintenance", propertyForm.maintenance);
    formData.append("propertyType", propertyForm.propertyType);
    formData.append("furnishing", propertyForm.furnishing);
    formData.append("availableFrom", propertyForm.availableFrom);
    formData.append("maxOccupancy", propertyForm.maxOccupancy);
    formData.append("facing", propertyForm.facing);
    formData.append("isPremium", propertyForm.isPremium);

    // Append objects/arrays as JSON strings
    formData.append("floor", JSON.stringify(propertyForm.floor));
    formData.append(
      "transportFacilities",
      JSON.stringify(propertyForm.transportFacilities)
    );
    formData.append("amenities", JSON.stringify(propertyForm.amenities));
    formData.append(
      "educationFacilities",
      JSON.stringify(propertyForm.educationFacilities)
    );
    formData.append(
      "premiumFeatures",
      JSON.stringify(propertyForm.premiumFeatures)
    );

    const token = await getToken();

    const res = await axios.post(
      "http://localhost:4000/api/property",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.property;
  };

  return { uploadProperty };
};

const API_URL = "http://localhost:4000/api/property";

// 🔁 Update property
export const updateProperty = async (id, data, token) => {
  const formData = new FormData();

  for (const key in data) {
    if (key === "images") {
      data.images.forEach((file) => {
        formData.append("pictures", file); // use field name expected by multer
      });
    } else if (
      typeof data[key] === "object" &&
      data[key] !== null &&
      !(data[key] instanceof File)
    ) {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  }

  const res = await axios.patch(`${API_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// ❌ Delete property
export const deleteProperty = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Fetch all properties
export const getProperties = async () => {
  const res = await axios.get(API_URL);
  return res.data.properties;
};
