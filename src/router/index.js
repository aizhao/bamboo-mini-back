const modelController = require("../controller/model");

router.get("/api/models", modelController.getModels);
router.post("/api/models", modelController.addModel);
router.put("/api/models/:id", modelController.updateModel);
router.delete("/api/models/:id", modelController.deleteModel);
router.post("/api/models/:id/review", modelController.reviewModel);
