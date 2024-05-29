const Warehouse = require("../models/warehouse");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/user");
const ImportRecord = require("../models/importRecord");
const ExportRecord = require("../models/exportRecord");
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

  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.product}`,
      });
    }

    const existingProduct = warehouse.products.find(
      (p) => p.product.toString() === item.product
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
const getAllImportRecords = asyncHandler(async (req, res) => {
  const importRecords = await ImportRecord.find()
    .populate({
      path: "warehouse",
      select: "name address",
    })
    .populate({
      path: "products.product",
      model: "Product",
    });

  if (!importRecords) {
    res
      .status(404)
      .json({ success: false, message: "No import records found" });
    return;
  }

  res.status(200).json({ success: true, importRecords });
});

const exportProducts = asyncHandler(async (req, res) => {
  const { warehouseId, products } = req.body;
  const warehouse = await Warehouse.findById(warehouseId);
  if (!warehouse) {
    return res
      .status(404)
      .json({ success: false, message: "Warehouse not found" });
  }

  for (const item of products) {
    const existingProduct = warehouse.products.find(
      (p) => p.product.toString() === item.product
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

    existingProduct.quantity -= item.quantity;
    if (existingProduct.quantity === 0) {
      warehouse.products = warehouse.products.filter(
        (p) => p.product.toString() !== item.product
      );
    }
  }

  await warehouse.save();

  const newExportRecord = await ExportRecord.create({
    warehouse: warehouseId,
    products: products.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })),
  });

  res
    .status(200)
    .json({ success: true, warehouse, exportRecord: newExportRecord });
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

  const warehouse = await Warehouse.findById(warehouseId);

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
  console.log(warehouseId);
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

module.exports = {
  createWarehouse,
  getUserWarehouses,
  deleteWarehouse,
  getUserWarehouseDescription,
  updateWarehouse,
  importProducts,
  exportProducts,
  getAllExportRecords,
  getAllImportRecords,
};
