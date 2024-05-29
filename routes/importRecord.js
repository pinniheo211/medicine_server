const router = require("express").Router();
const ctrls = require("../controllers/importRecord");
const { verifyAccessToken } = require("../middlewares/verifyToken");

router.get("/", [verifyAccessToken], ctrls.getAllImportRecords);

module.exports = router;
