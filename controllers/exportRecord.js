const asyncHandler = require("express-async-handler");
const ExportRecord = require("../models/exportRecord");
const { default: mongoose } = require("mongoose");

const getAllExportRecords = asyncHandler(async (req, res) => {
  try {
    const exportRecords = await ExportRecord.find()
      .populate({
        path: "warehouse",
        select: "name address",
      })
      .populate({
        path: "products.product",
        model: "Product",
        select: "name price", // Select the fields you want to return
      });

    if (!exportRecords || exportRecords.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No export records found" });
    }

    res.status(200).json({ success: true, exportRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
const getExportRecordById = asyncHandler(async (req, res) => {
  try {
    const exportRecordId = req.params.id;

    // Kiểm tra xem exportRecordId có đúng định dạng ObjectId hay không
    if (!mongoose.Types.ObjectId.isValid(exportRecordId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid export record ID" });
    }

    // Tìm phiếu xuất theo ID và populate thông tin kho hàng và sản phẩm
    const exportRecord = await ExportRecord.findById(exportRecordId)
      .populate({
        path: "warehouse",
        select: "name address",
      })
      .populate({
        path: "products.product",
        model: "Product",
        select: "name price",
      });

    // Kiểm tra xem phiếu xuất có tồn tại không
    if (!exportRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Export record not found" });
    }

    res.status(200).json({ success: true, exportRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { getAllExportRecords, getExportRecordById };
