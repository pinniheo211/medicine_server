const asyncHandler = require("express-async-handler");
const ImportRecord = require("../models/importRecord");

// Lấy tất cả các phiếu nhập
const getAllImportRecords = asyncHandler(async (req, res) => {
  const importRecords = await ImportRecord.find()
    .populate("warehouse")
    .populate("products.product");

  if (!importRecords) {
    return res
      .status(404)
      .json({ success: false, message: "No import records found" });
  }

  res.status(200).json({ success: true, importRecords });
});

module.exports = { getAllImportRecords };
