const router = require("express").Router();
const ctrls = require("../controllers/exportRecord");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.get("/", [verifyAccessToken], ctrls.getAllExportRecords);
router.get("/:id", [verifyAccessToken], ctrls.getExportRecordById);

module.exports = router;
