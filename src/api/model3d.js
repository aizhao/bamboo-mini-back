const express = require("express");
const router = express.Router();
const model3dService = require("../model/model3d");
const { verifyToken } = require("../middleware/auth");

// 获取3D模型列表
router.get("/list", verifyToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, name, category, status } = req.query;
    const params = {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      name,
      category,
      status: status !== undefined ? parseInt(status) : undefined,
    };

    const { rows, total } = await model3dService.getModel3DList(params);
    console.log(rows, total);
    res.json({
      code: 0,
      message: "获取成功",
      data: {
        list: rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error("获取3D模型列表失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取3D模型列表失败",
      error: error.message,
    });
  }
});

// 创建3D模型
router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      modelUrl,
      thumbnailUrl,
      tags,
      size,
      format,
    } = req.body;

    if (!name || !category || !modelUrl || !size || !format) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "名称、分类、模型URL、大小和格式为必填项",
      });
    }

    const id = await model3dService.createModel3D({
      name,
      description,
      category,
      modelUrl,
      thumbnailUrl,
      tags,
      size,
      format,
      author: req.user.username,
    });

    res.json({
      code: 0,
      message: "创建成功",
      data: { id },
    });
  } catch (error) {
    console.error("创建3D模型失败:", error);
    res.status(500).json({
      code: 500,
      message: "创建3D模型失败",
      error: error.message,
    });
  }
});

// 更新3D模型
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      modelUrl,
      thumbnailUrl,
      tags,
      size,
      format,
    } = req.body;

    if (!name || !category || !modelUrl || !size || !format) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "名称、分类、模型URL、大小和格式为必填项",
      });
    }

    const success = await model3dService.updateModel3D(id, {
      name,
      description,
      category,
      modelUrl,
      thumbnailUrl,
      tags,
      size,
      format,
    });

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: "3D模型不存在",
        error: "未找到指定ID的3D模型",
      });
    }

    res.json({
      code: 0,
      message: "更新成功",
    });
  } catch (error) {
    console.error("更新3D模型失败:", error);
    res.status(500).json({
      code: 500,
      message: "更新3D模型失败",
      error: error.message,
    });
  }
});

// 删除3D模型
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const success = await model3dService.deleteModel3D(id);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: "3D模型不存在",
        error: "未找到指定ID的3D模型",
      });
    }

    res.json({
      code: 0,
      message: "删除成功",
    });
  } catch (error) {
    console.error("删除3D模型失败:", error);
    res.status(500).json({
      code: 500,
      message: "删除3D模型失败",
      error: error.message,
    });
  }
});

// 审核3D模型
router.put("/review/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    if (status === undefined) {
      return res.status(400).json({
        code: 400,
        message: "缺少必要字段",
        error: "审核状态为必填项",
      });
    }

    const success = await model3dService.reviewModel3D(
      id,
      status,
      reviewComment
    );

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: "3D模型不存在",
        error: "未找到指定ID的3D模型",
      });
    }

    res.json({
      code: 0,
      message: "审核成功",
    });
  } catch (error) {
    console.error("审核3D模型失败:", error);
    res.status(500).json({
      code: 500,
      message: "审核3D模型失败",
      error: error.message,
    });
  }
});

// 获取单个3D模型信息
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const model = await model3dService.getModel3DById(id);

    if (!model) {
      return res.status(404).json({
        code: 404,
        message: "模型不存在",
      });
    }

    res.json({
      code: 0,
      message: "获取成功",
      data: model,
    });
  } catch (error) {
    console.error("获取3D模型信息失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取3D模型信息失败",
      error: error.message,
    });
  }
});

module.exports = router;
