const ProductCategory = require("../models/productCategory");
const Brand = require("../models/brand");
const asyncHandler = require("express-async-handler");

const createBrand = asyncHandler(async (req, res) => {
  const response = await Brand.create(req.body);
  return res.json({
    success: response ? true : false,
    createdBrand: response ? response : "Cannot create brand",
  });
});
const getAllBrands = asyncHandler(async (req, res) => {
  const response = await Brand.find().select("title _id");
  return res.json({
    success: response ? true : false,
    brands: response ? response : "Cannot get brand",
  });
});

const getBrandById = asyncHandler(async (req, res) => {
  try {
    const brandId = req.params.id;
    const brand = await Brand.findById(brandId).select(
      "title _id description createdAt"
    );

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.json({
      success: true,
      brand,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndUpdate(bid, req.body, {
    new: true,
  });
  return res.json({
    success: response ? true : false,
    updatedBrand: response ? response : "Cannot update Brand",
  });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { bid } = req.params;
  const response = await Brand.findByIdAndDelete(bid);
  return res.json({
    success: response ? true : false,
    DeletedBrand: response ? response : "Cannot delete brand",
  });
});

module.exports = {
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
  getBrandById,
};
