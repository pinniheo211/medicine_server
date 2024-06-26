const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/user");
const xlsx = require("xlsx");
const { default: mongoose } = require("mongoose");

const importProducts = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(worksheet);

  const userId = req.user._id;
  const newProducts = [];

  for (const row of rows) {
    const { title, price, description, brand, category } = row;
    if (!(title && price && description && brand && category)) {
      throw new Error("Missing inputs");
    }

    const slug = slugify(title);
    const productData = { title, price, description, brand, category, slug };

    const newProduct = await Product.create(productData);
    newProducts.push(newProduct._id);

    await User.findByIdAndUpdate(userId, {
      $push: { products: { $each: [newProduct._id], $position: 0 } },
    });
  }

  return res.status(200).json({
    success: true,
    importedProducts: newProducts,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category } = req.body;
  const images = req?.files?.images?.map((el) => el.path);

  if (!(title && price && description && brand && category)) {
    throw new Error("Missing inputs");
  }

  req.body.slug = slugify(title);
  if (images) req.body.images = images;

  const newProduct = await Product.create(req.body);
  const userId = req.user._id;

  // Add the new product ID to the beginning of the user's products array
  await User.findByIdAndUpdate(userId, {
    $push: { products: { $each: [newProduct._id], $position: 0 } },
  });

  return res.status(200).json({
    success: !!newProduct,
    createdProduct: newProduct || "Cannot create new product",
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  const product = await Product.findById(pid)
    .populate("brand")
    .populate("category");
  return res.status(200).json({
    success: product ? true : false,
    productData: product ? product : "Cannot get product",
  });
});
const getProducts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate({
    path: "products",
    populate: [{ path: "brand" }, { path: "category" }],
  });

  return res.status(200).json({
    success: user.products ? true : false,
    productDatas: user.products ? user.products : "Cannot get products",
  });
});
const updateProduct = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { pid } = req.params;
  const images = req?.files?.images?.map((el) => el.path);
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const user = await User.findById(userId);
  if (!user || !user.products.includes(pid)) {
    res.status(403);
    throw new Error("User does not have access to update this product");
  }
  if (images) req.body.images = images;
  const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, {
    new: true,
  });
  return res.status(200).json({
    success: updatedProduct ? true : false,
    updatedProduct: updatedProduct ? updatedProduct : "Cannot update product",
  });
});
const deleteProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;

  if (!mongoose.Types.ObjectId.isValid(pid)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product ID" });
  }

  const product = await Product.findById(pid);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  // Xóa tham chiếu sản phẩm từ danh sách `products` của người dùng
  await User.updateMany({ products: pid }, { $pull: { products: pid } });

  await product.remove();

  return res.status(200).json({
    success: true,
    message: `Product with ID ${pid} has been deleted`,
  });
});

const deleteUserProductByAdmin = asyncHandler(async (req, res) => {
  const { userId, productId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user ID or product ID" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const productIndex = user.products.indexOf(productId);
  if (productIndex > -1) {
    user.products.splice(productIndex, 1);
    await user.save();
  }

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }

  return res.status(200).json({
    success: true,
    message: `Product with ID ${productId} has been deleted`,
  });
});

const uploadImageProduct = asyncHandler(async (req, res) => {
  const { pid } = req.params;
  if (!req.files) throw new Error("Missing input");
  const response = await Product.findByIdAndUpdate(pid, {
    $push: { images: { $each: req.files.map((el) => el.path) } },
  });
  return res.status(200).json({
    status: response ? true : false,
    updateProduct: response ? response : "Cannot upload image product",
  });
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  uploadImageProduct,
  importProducts,
  deleteUserProductByAdmin,
};
