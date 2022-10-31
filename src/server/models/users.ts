import mongoose, { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document{
  name: string;
  classNumber: number;
  email: string;
  password: string;
  phone: string;
  dob: Date;
  photo: string;
  isDeleted: boolean;
}

interface User {
  name: string;
  classNumber: number;
  email: string;
  password: string;
  phone: string;
  dob: Date;
  photo: string;
  isDeleted: boolean;
}

const userSchema = new Schema
<User>
({
  name: {
    type: String,
    required: true,
  },
  classNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  dob: {
    type: Date ,
    // required: true,
  },
  photo: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    required: true
  }
});

userSchema.methods.toJSON = function() {
  var obj = this.toObject()
  delete obj.password
  return obj
}

const UserModel = model<User>("users", userSchema, "users");


export default UserModel;
