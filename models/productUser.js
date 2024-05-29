const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var ProductUserSchema = new mongoose.Schema({
  products: [
    {
      product: { type: mongoose.Types.ObjectId, ref: "Product" },
      required: true,
      unique: true,
      index: true,
    },
  ],
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//Export the model
module.exports = mongoose.model("User", userSchema);
