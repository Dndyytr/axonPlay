import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: { type: String, default: "" },
    watchlist: [
      {
        mal_id: { type: Number, required: true },
        title: { type: String, required: true },
        image: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    watchHistory: [
      {
        mal_id: { type: Number, required: true },
        title: { type: String, required: true },
        episodeNumber: { type: Number, default: 1 },
        progress: { type: Number, default: 0 }, // in seconds
        duration: Number,
        lastWatched: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// 🔒 Hash password sebelum disimpan
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ Bandingkan password saat login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Return user tanpa field sensitif
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.watchlist;
  delete user.watchHistory;
  return user;
};

export default mongoose.model("User", userSchema);
