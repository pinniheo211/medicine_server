const Warehouse = require("../models/warehouse");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/user");
const ImportRecord = require("../models/importRecord");
const ExportRecord = require("../models/exportRecord");
const exportRecord = require("../models/exportRecord");
const createWarehouse = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.address) {
    throw new Error("Missing inputs");
  }

  const newWarehouse = await Warehouse.create(req.body);

  const userId = req.user._id;
  await User.findByIdAndUpdate(userId, {
    $push: { warehouses: newWarehouse._id },
  });

  return res.status(200).json({
    success: newWarehouse ? true : false,
    createdWarehouse: newWarehouse
      ? newWarehouse
      : "Cannot create new warehouse",
  });
});
const importProducts = asyncHandler(async (req, res) => {
  const { warehouseId, products } = req.body;
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    return res
      .status(404)
      .json({ success: false, message: "Warehouse not found" });
  }

  const importRecord = new ImportRecord({
    warehouse: warehouseId,
    products,
  });

  const userId = req.user._id;
  await User.findByIdAndUpdate(userId, {
    $push: { importRecords: importRecord },
  });

  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.product}`,
      });
    }

    const existingProduct = warehouse.products.find(
      (p) => p.product.toString() === item.product._id
    );

    if (existingProduct) {
      existingProduct.quantity += item.quantity;
    } else {
      warehouse.products.push({
        product: item.product,
        quantity: item.quantity,
      });
    }
  }

  await warehouse.save();
  await importRecord.save();
  res.status(200).json({ success: true, warehouse, importRecord });
});

const getAllImportRecordsForUser = asyncHandler(async (req, res) => {
  // const userId = req.user._id;
  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ success: false, message: "Invalid user ID" });
  // }
  // const user = await User.findById(userId).populate("warehouses");
  // if (!user) {
  //   return res.status(404).json({ success: false, message: "User not found" });
  // }
  // const warehouseIds = user.warehouses.map((warehouse) => warehouse._id);
  // const importRecords = await ImportRecord.find({
  //   warehouse: { $in: warehouseIds },
  // })
  //   .populate({
  //     path: "warehouse",
  //     select: "name address",
  //   })
  //   .populate({
  //     path: "products.product",
  //     model: "Product",
  //   });
  // if (!importRecords || importRecords.length === 0) {
  //   return res
  //     .status(404)
  //     .json({ success: false, message: "No import records found" });
  // }
  // res.status(200).json({ success: true, importRecords });
});

const exportProducts = asyncHandler(async (req, res) => {
  const { warehouseId, products, address } = req.body;

  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    return res
      .status(404)
      .json({ success: false, message: "Warehouse not found" });
  }

  const mergedProducts = products.reduce((acc, product) => {
    const existingProduct = acc.find(
      (p) => p.product.toString() === product.product?._id
    );
    if (existingProduct) {
      existingProduct.quantity += product.quantity;
    } else {
      acc.push({ ...product });
    }
    return acc;
  }, []);

  for (const item of mergedProducts) {
    const existingProduct = warehouse.products.find(
      (p) => p.product.toString() === item.product._id
    );
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found in warehouse: ${item.product}`,
      });
    }

    if (existingProduct.quantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity for product: ${item.product}`,
      });
    }
  }

  for (const item of mergedProducts) {
    const existingProduct = warehouse.products.find(
      (p) => p.product.toString() === item.product?._id
    );
    console.log(existingProduct);
    existingProduct.quantity -= item.quantity;
    if (existingProduct.quantity === 0) {
      warehouse.products = warehouse.products.filter(
        (p) => p.product.toString() !== item.product
      );
    }
  }

  await warehouse.save();

  const exportRecord = new ExportRecord({
    warehouse: warehouseId,
    products: mergedProducts,
    address,
    user: req.user._id,
  });

  await exportRecord.save();

  // Cập nhật thông tin người dùng
  const userId = req.user._id;
  await User.findByIdAndUpdate(userId, {
    $push: { exportRecords: exportRecord },
  });

  res.status(200).json({ success: true, warehouse, exportRecord });
});

const getAllExportRecords = asyncHandler(async (req, res) => {
  const exportRecords = await ExportRecord.find()
    .populate({
      path: "warehouse",
      select: "name address",
    })
    .populate({
      path: "products.product",
      model: "Product",
    });

  if (!exportRecords) {
    res
      .status(404)
      .json({ success: false, message: "No export records found" });
    return;
  }

  res.status(200).json({ success: true, exportRecords });
});

const getUserWarehouses = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate("warehouses");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  return res.status(200).json({
    success: true,
    warehouses: user.warehouses ? user.warehouses : "Warehouse not found",
  });
});

const getUserWarehouseDescription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const warehouseId = req.params.id;

  const warehouse = await Warehouse.findById(warehouseId).populate({
    path: "products.product",
    model: "Product",
  });

  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }
  const user = await User.findById(userId);
  if (!user || !user.warehouses.includes(warehouseId)) {
    res.status(403);
    throw new Error("User does not have access to this warehouse");
  }

  return res.status(200).json({
    success: warehouse ? true : false,
    description: warehouse ? warehouse : "something wrong",
  });
});

const deleteWarehouse = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const warehouseId = req.params.id;
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { warehouses: warehouseId } },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await Warehouse.findByIdAndDelete(warehouseId);

  return res.status(200).json({
    success: true,
    message: "Warehouse deleted successfully",
  });
});

const updateWarehouse = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const warehouseId = req.params.id;
  const { name, address } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.warehouses.includes(warehouseId)) {
    res.status(403);
    throw new Error("User does not have access to update this warehouse");
  }

  const updatedWarehouse = await Warehouse.findByIdAndUpdate(
    warehouseId,
    { name, address },
    { new: true }
  );

  if (!updatedWarehouse) {
    res.status(404);
    throw new Error("Warehouse not found");
  }

  return res.status(200).json({
    success: true,
    updatedWarehouse,
  });
});

const getEndOfMonthInventory = asyncHandler(async (req, res) => {
  try {
    const { warehouseId, month, year } = req.query;

    // Tạo ngày bắt đầu và kết thúc của tháng
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Tìm kho hàng và điền thông tin sản phẩm
    const warehouse = await Warehouse.findById(warehouseId).populate({
      path: "products.product",
      model: "Product",
    });

    if (!warehouse) {
      return res
        .status(404)
        .json({ success: false, message: "Warehouse not found" });
    }

    // Tìm tất cả các phiếu nhập trong khoảng thời gian
    const importRecords = await ImportRecord.find({
      warehouse: warehouseId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Tìm tất cả các phiếu xuất trong khoảng thời gian
    const exportRecords = await ExportRecord.find({
      warehouse: warehouseId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Khởi tạo đối tượng tồn kho
    const inventory = {};

    // Bắt đầu với số lượng hiện tại trong kho
    warehouse.products.forEach((item) => {
      inventory[item.product._id] = {
        product: item.product,
        initialQuantity: item.quantity,
        importedQuantity: 0,
        exportedQuantity: 0,
        finalQuantity: item.quantity,
      };
    });

    // Cộng thêm số lượng từ phiếu nhập
    importRecords.forEach((record) => {
      record.products.forEach((item) => {
        if (inventory[item.product]) {
          inventory[item.product].importedQuantity += item.quantity;
          inventory[item.product].finalQuantity += item.quantity;
        } else {
          inventory[item.product] = {
            product: item.product,
            initialQuantity: 0,
            importedQuantity: item.quantity,
            exportedQuantity: 0,
            finalQuantity: item.quantity,
          };
        }
      });
    });

    // Trừ bớt số lượng từ phiếu xuất
    exportRecords.forEach((record) => {
      record.products.forEach((item) => {
        if (inventory[item.product]) {
          inventory[item.product].exportedQuantity += item.quantity;
          inventory[item.product].finalQuantity -= item.quantity;
        } else {
          inventory[item.product] = {
            product: item.product,
            initialQuantity: 0,
            importedQuantity: 0,
            exportedQuantity: item.quantity,
            finalQuantity: -item.quantity,
          };
        }
      });
    });

    // Trả về kết quả với toàn bộ đối tượng sản phẩm và thông tin cần thiết
    res.status(200).json({
      success: true,
      warehouseName: warehouse.name,
      inventory: Object.values(inventory),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  createWarehouse,
  getUserWarehouses,
  deleteWarehouse,
  getUserWarehouseDescription,
  updateWarehouse,
  importProducts,
  exportProducts,
  getAllExportRecords,
  getAllImportRecordsForUser,
  getEndOfMonthInventory,
};
