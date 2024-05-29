const userRouter = require("./user");
const productRouter = require("./product");
const productCategoryRouter = require("./productCategory");
const warehouseRouter = require("./warehouse");
const brandRouter = require("./brand");
const warehouseExportRouter = require("./warehouseExport");
const { notFound, errHandler } = require("../middlewares/errHandler");

const initRoutes = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);
  app.use("/api/productcategory", productCategoryRouter);
  app.use("/api/warehouse", warehouseRouter);
  app.use("/api/brand", brandRouter);
  app.use("/api/warehouseExport", warehouseExportRouter);

  app.use(notFound);
  app.use(errHandler);
};

module.exports = initRoutes;
