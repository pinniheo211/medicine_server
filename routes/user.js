const router = require("express").Router();
const ctrls = require("../controllers/user");
const { verifyAccessToken, isAdmin } = require("../middlewares/verifyToken");

router.post("/register", ctrls.register);
router.post("/login", ctrls.login);
router.get("/current", verifyAccessToken, ctrls.getCurrent);
router.post("/refreshtoken", ctrls.refreshAccessToken);
router.get("/logout", ctrls.logout);
router.get("/forgotpassword", ctrls.forgotPassword);
router.put("/resetpassword", ctrls.resetPassword);
router.get("/", [verifyAccessToken, isAdmin], ctrls.getUsers);
router.get("/:id", [verifyAccessToken, isAdmin], ctrls.getUserById);
router.delete("/", [verifyAccessToken, isAdmin], ctrls.deleteUser);
router.put("/current", [verifyAccessToken], ctrls.updateUser);
router.put("/:uid", [verifyAccessToken, isAdmin], ctrls.updateUserByAdmin);
router.put("/block/:id", [verifyAccessToken, isAdmin], ctrls.blockUser);
router.put("/unblock/:id", [verifyAccessToken, isAdmin], ctrls.unblockUser);
router.get(
  "/products/:userId",
  [verifyAccessToken, isAdmin],
  ctrls.getUserProducts
);
router.get(
  "/warehouses/:userId",
  [verifyAccessToken, isAdmin],
  ctrls.getUserWarehousesByAdmin
);

module.exports = router;
