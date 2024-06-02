const asyncHandler = require("express-async-handler");
const ExportRecord = require("../models/exportRecord");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");

const getAllExportRecords = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(userId).populate({
      path: "exportRecords",
      populate: [
        { path: "warehouse", select: "name address" },
        { path: "products.product", model: "Product", select: "name price" },
      ],
    });

    if (!user || user.exportRecords.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No export records found" });
    }

    res.status(200).json({ success: true, data: user.exportRecords });
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
      .populate("products.product");

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
