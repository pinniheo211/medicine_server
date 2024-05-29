const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    owner: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Warehouse", warehouseSchema);
