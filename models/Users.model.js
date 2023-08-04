import mongoose, { Mongoose } from "mongoose";
import bcrypt from "bcrypt";

const userCollection = "Users";
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  age: String,
  password: String,
  role: { type: String, default: "usuario" },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;
