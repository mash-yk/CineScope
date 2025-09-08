import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "" },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, default: "" },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, default: "abusive/misleading" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const movieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    detail: { type: String, default: "" },
    image: { type: String, default: "" },
    trailerUrl: { type: String, default: "" },
    year: { type: Number },
    genres: [{ type: String }],
    cast: [{ type: String }],
    reviews: [reviewSchema],
    avgRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

movieSchema.methods.recomputeRating = function () {
  this.numReviews = this.reviews.length;
  if (!this.numReviews) {
    this.avgRating = 0;
  } else {
    const sum = this.reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0);
    this.avgRating = Math.round((sum / this.numReviews) * 10) / 10;
  }
};

export default mongoose.models.Movie || mongoose.model("Movie", movieSchema);
