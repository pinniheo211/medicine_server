const router = require("express").Router();
const ctrls = require("../controllers/warehouse");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken], ctrls.createWarehouse);
router.get("/", [verifyAccessToken], ctrls.getUserWarehouses);
router.get("/:id", [verifyAccessToken], ctrls.getUserWarehouseDescription);
router.delete("/:id", [verifyAccessToken], ctrls.deleteWarehouse);
router.put("/update/:id", [verifyAccessToken], ctrls.updateWarehouse);

module.exports = router;
