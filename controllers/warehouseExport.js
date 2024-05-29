const asyncHandler = require("express-async-handler");
const DispatchSlip = require("../models/warehouseExport");
const Warehouse = require("../models/warehouse");
const Product = require("../models/product");
const User = require("../models/user");

const createDispatchSlip = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { warehouseId, products, plannedDate } = req.body;

  if (!warehouseId || !products || products.length === 0 || !plannedDate) {
    res.status(400);
    throw new Error("Thiếu thông tin kho hàng, sản phẩm hoặc ngày kế hoạch");
  }

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    res.status(404);
    throw new Error("Không tìm thấy kho hàng");
  }

  // Kiểm tra xem kho hàng có thuộc về user hay không

  // Kiểm tra số lượng sản phẩm
  for (let item of products) {
    const product = await Product.findById(item.product);
    console.log(product);
    if (!product) {
      res.status(404);
      throw new Error(`Không tìm thấy sản phẩm: ${item.product}`);
    }
  }

  // Tạo phiếu xuất kho
  const newDispatchSlip = await DispatchSlip.create({
    user: userId,
    warehouse: warehouseId,
    products: products.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })),
    plannedDate: plannedDate, // Thêm ngày kế hoạch
  });

  // Cập nhật số lượng sản phẩm trong kho
  for (let item of products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity, sold: item.quantity },
    });
  }

  res.status(201).json({
    success: true,
    dispatchSlip: newDispatchSlip,
  });
});

module.exports = { createDispatchSlip };
