import cron from "node-cron";
import Merchandise from "../models/merchandiseModel.js";

cron.schedule("0 0 * * *", async () => {
  try {
    await Merchandise.deleteMany({ stock: { $lte: 0 } });
    console.log("Cleaned up out-of-stock merchandise");
  } catch (error) {
    console.error("Cleanup error:", error);
  }
});
