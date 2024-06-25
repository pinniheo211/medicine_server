const router = require("express").Router();
const express = require("express");
const ctrls = require("../controllers/product");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloundinary.config");
const product = express();
const muilter = require("multer");

const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");

product.use(bodyParser.urlencoded({ extended: true }));
product.use(express.static(path.resolve(__dirname, "assets")));
var storage = muilter.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/assets/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

router.post(
  "/",
  [verifyAccessToken],
  uploader.fields([{ name: "images", maxCount: 10 }]),
  ctrls.createProduct
);

router.post(
  "/import",
  [verifyAccessToken],
  upload.single("file"),
  ctrls.importProducts
);

router.get("/", [verifyAccessToken], ctrls.getProducts);

router.put(
  "/uploadimage/:pid",
  [verifyAccessToken, isAdmin],
  uploader.single("images"),
  ctrls.uploadImageProduct
);

router.put(
  "/:pid",
  [verifyAccessToken],
  uploader.fields([{ name: "images", maxCount: 10 }]),
  ctrls.updateProduct
);
router.delete("/:pid", [verifyAccessToken], ctrls.deleteProduct);
router.get("/:pid", ctrls.getProduct);

module.exports = router;
