const mongoose = require("mongoose");
const dispatchSlipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    plannedDate: { type: Date, required: true }, // Thêm trường ngày kế hoạch
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
module.exports = mongoose.model("DispatchSlip", dispatchSlipSchema);
