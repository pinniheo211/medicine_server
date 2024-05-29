const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const User = require("../models/user");

const createProduct = asyncHandler(async (req, res) => {
  const { title, price, description, brand, category } = req.body;
  const images = req?.files?.images?.map((el) => el.path);
  if (!(title && price && description && brand && category))
    throw new Error("Missing inputs");
  req.body.slug = slugify(title);
  if (images) req.body.images = images;
  const newProduct = await Product.create(req.body);
  const userId = req.user._id;
  await User.findByIdAndUpdate(userId, {
    $push: { products: newProduct._id },
  });
  return res.status(200).json({
    success: newProduct ? true : false,
    createdProduct: newProduct ? newProduct : "Cannot create new product",
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
  if (req.body && req.body.title) req.body.slug = slugify(req.body.title);
  const user = await User.findById(userId);
  if (!user || !user.products.includes(pid)) {
    res.status(403);
    throw new Error("User does not have access to update this product");
  }
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
  const deletedProduct = await Product.findByIdAndDelete(pid);
  return res.status(200).json({
    success: deletedProduct ? true : false,
    deletedProduct: deletedProduct ? deletedProduct : "Cannot delete product",
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
};
