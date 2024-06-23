const ProductCategory = require("../models/productCategory");

const asyncHandler = require("express-async-handler");

const createCategory = asyncHandler(async (req, res) => {
  const response = await ProductCategory.create(req.body);
  return res.json({
    success: response ? true : false,
    createdCategory: response ? response : "Cannot create new product category",
  });
});
const getAllCategories = asyncHandler(async (req, res) => {
  try {
    const response = await ProductCategory.find().select("title _id createdAt");
    return res.json({
      success: response ? true : false,
      productCategories: response ? response : "Cannot get product category",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const getCategoryById = asyncHandler(async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await ProductCategory.findById(categoryId).select(
      "title _id createdAt"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndUpdate(pcid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedCategory: response ? response : "Cannot update product category",
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { pcid } = req.params;
  const response = await ProductCategory.findByIdAndDelete(pcid);
  return res.json({
    success: response ? true : false,
    updatedCategory: response ? response : "Cannot delete product category",
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getCategoryById,
};
