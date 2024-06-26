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
router.get(
  "/inventory/end-of-month",
  [verifyAccessToken],
  ctrls.getEndOfMonthInventory
);
router.get(
  "/import-record/",
  [verifyAccessToken],
  ctrls.getAllImportRecordsForUser
);
router.get("/export-records", [verifyAccessToken], ctrls.getAllExportRecords);
router.delete(
  "/admin/user/:userId/warehouse/:warehouseId",
  [verifyAccessToken],
  ctrls.deleteUserWarehouseByAdmin
);

module.exports = router;
