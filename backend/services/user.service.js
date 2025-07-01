import userModel from "../models/user.model.js"; // Note the .js extension

export const registerUser = async ({
  firstname,
  lastname,
  email,
  password,
  role,
}) => {
  if (!firstname || !lastname || !email || !password || !role) {
    throw new Error("All fields are required");
  }

  const user = await userModel.create({
    fullname: {
      firstname,
      lastname,
    },
    email,
    password,
    role,
  });

  return user;
};
