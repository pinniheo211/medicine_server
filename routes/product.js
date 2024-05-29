const router = require("express").Router();
const ctrls = require("../controllers/product");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");
const uploader = require("../config/cloundinary.config");
router.post(
  "/",
  [verifyAccessToken],
  uploader.fields([{ name: "images", maxCount: 10 }]),
  ctrls.createProduct
);
router.get("/", [verifyAccessToken], ctrls.getProducts);

router.put(
  "/uploadimage/:pid",
  [verifyAccessToken, isAdmin],
  uploader.single("images"),
  ctrls.uploadImageProduct
);

router.put("/:pid", [verifyAccessToken], ctrls.updateProduct);
router.delete("/:pid", [verifyAccessToken, isAdmin], ctrls.deleteProduct);
router.get("/:pid", ctrls.getProduct);

module.exports = router;
