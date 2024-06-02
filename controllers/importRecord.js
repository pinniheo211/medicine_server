const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const Warehouse = require("../models/warehouse");
const ImportRecord = require("../models/importRecord");

const getAllImportRecords = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId).populate({
      path: "importRecords",
      populate: [
        { path: "warehouse", select: "name address" },
        { path: "products.product", model: "Product", select: "name price" },
      ],
    });

    if (!user || !user.importRecords || user.importRecords.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No import records found" });
    }

    res.status(200).json({ success: true, data: user.importRecords });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const getImportRecordById = asyncHandler(async (req, res) => {
  try {
    const importRecordId = req.params.id;

    // Kiểm tra xem importRecordId có đúng định dạng ObjectId hay không
    if (!mongoose.Types.ObjectId.isValid(importRecordId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid import record ID" });
    }

    // Tìm phiếu nhập theo ID và populate thông tin kho hàng và sản phẩm
    const importRecord = await ImportRecord.findById(importRecordId)
      .populate({
        path: "warehouse",
        select: "name address",
      })
      .populate({
        path: "products.product",
        model: "Product",
      });

    // Kiểm tra xem phiếu nhập có tồn tại không
    if (!importRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Import record not found" });
    }

    res.status(200).json({ success: true, importRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { getAllImportRecords, getImportRecordById };
