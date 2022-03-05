const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  friends: {
    type: Number,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  profession: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  relationship_status: {
    type: String,
  },
});

module.exports = UserProfile = mongoose.model("userProfile", UserProfileSchema);
