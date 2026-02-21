import mongoose from "mongoose";

const healthHistorySchema = new mongoose.Schema(
  {
    chronicDiseases: [
      {
        type: String
      }
    ],
    allergies: [
      {
        type: String
      }
    ],
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String
      }
    ],
    surgeries: [
      {
        surgeryName: String,
        year: Number,
        hospital: String
      }
    ],
    familyHistory: [
      {
        relation: String,
        condition: String
      }
    ],
    habits: {
      smoking: {
        type: Boolean,
        default: false
      },
      alcohol: {
        type: Boolean,
        default: false
      },
      exerciseFrequency: {
        type: String 
      }
    },
    emergencyContact: {
      name: String,
      relation: String,
      phoneNumber: String
    },
    notes: {
      type: String
    }
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    dob: {
      type: Date,
    },
    bloodGroup: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },

   
    healthHistory: healthHistorySchema
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;