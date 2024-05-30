const router = require("express").Router();
const ctrls = require("../controllers/importRecord");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.get("/", [verifyAccessToken], ctrls.getAllImportRecords);
router.get("/:id", [verifyAccessToken], ctrls.getImportRecordById);

module.exports = router;
