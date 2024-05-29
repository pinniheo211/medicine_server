const Warehouse = require("../models/warehouse");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/user");
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
};
