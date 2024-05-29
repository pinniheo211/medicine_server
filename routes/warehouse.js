const router = require("express").Router();
const ctrls = require("../controllers/warehouse");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.post("/", [verifyAccessToken], ctrls.createWarehouse);
router.get("/", [verifyAccessToken], ctrls.getUserWarehouses);
router.get("/:id", [verifyAccessToken], ctrls.getUserWarehouseDescription);
router.delete("/:id", [verifyAccessToken], ctrls.deleteWarehouse);
router.put("/update/:id", [verifyAccessToken], ctrls.updateWarehouse);
router.post("/import", [verifyAccessToken], ctrls.importProducts);
router.post("/export", [verifyAccessToken], ctrls.exportProducts);
router.post("/import-records", [verifyAccessToken], ctrls.getAllImportRecords);
router.post("/export-records", [verifyAccessToken], ctrls.getAllExportRecords);
module.exports = router;
