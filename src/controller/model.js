const { Model } = require("../model/model");
const { success, error } = require("../utils/response");

// 初始化测试数据
const initTestData = async () => {
  try {
    const count = await Model.countDocuments();
    if (count === 0) {
      const testData = [
        {
          name: "竹簧雕刻-龙纹",
          description: "传统竹簧雕刻工艺制作的龙纹图案，展现了精湛的雕刻技艺",
          modelUrl: "https://example.com/models/dragon.glb",
          previewUrl: "https://example.com/previews/dragon.jpg",
          status: "published",
          createTime: new Date("2024-01-01"),
        },
        {
          name: "竹簧雕刻-凤纹",
          description: "精美的凤纹竹簧雕刻作品，展现了传统工艺的魅力",
          modelUrl: "https://example.com/models/phoenix.glb",
          previewUrl: "https://example.com/previews/phoenix.jpg",
          status: "published",
          createTime: new Date("2024-01-15"),
        },
        {
          name: "竹簧雕刻-山水",
          description: "山水题材的竹簧雕刻作品，展现了自然之美",
          modelUrl: "https://example.com/models/landscape.glb",
          previewUrl: "https://example.com/previews/landscape.jpg",
          status: "pending",
          createTime: new Date("2024-02-01"),
        },
        {
          name: "竹簧雕刻-花鸟",
          description: "花鸟题材的竹簧雕刻作品，展现了生机勃勃的自然景象",
          modelUrl: "https://example.com/models/flower-bird.glb",
          previewUrl: "https://example.com/previews/flower-bird.jpg",
          status: "rejected",
          reviewComment: "作品质量不符合要求",
          reviewTime: new Date("2024-02-15"),
          createTime: new Date("2024-02-10"),
        },
      ];
      await Model.insertMany(testData);
      console.log("测试数据初始化成功");
    }
  } catch (err) {
    console.error("测试数据初始化失败:", err);
  }
};

// 调用初始化函数
initTestData();

// 获取模型列表
exports.getModels = async (ctx) => {
  try {
    const { page = 1, pageSize = 10, name, status } = ctx.query;
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (status) {
      query.status = status;
    }

    const total = await Model.countDocuments(query);
    const list = await Model.find(query)
      .sort({ createTime: -1 })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize));

    ctx.body = success({
      list,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    ctx.body = error("获取模型列表失败");
  }
};

// 添加模型
exports.addModel = async (ctx) => {
  try {
    const { name, description, modelUrl, previewUrl } = ctx.request.body;
    const model = new Model({
      name,
      description,
      modelUrl,
      previewUrl,
      status: "pending",
      createTime: new Date(),
    });
    await model.save();
    ctx.body = success("添加成功");
  } catch (err) {
    ctx.body = error("添加失败");
  }
};

// 更新模型
exports.updateModel = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { name, description, modelUrl, previewUrl } = ctx.request.body;
    await Model.findByIdAndUpdate(id, {
      name,
      description,
      modelUrl,
      previewUrl,
      updateTime: new Date(),
    });
    ctx.body = success("更新成功");
  } catch (err) {
    ctx.body = error("更新失败");
  }
};

// 删除模型
exports.deleteModel = async (ctx) => {
  try {
    const { id } = ctx.params;
    await Model.findByIdAndDelete(id);
    ctx.body = success("删除成功");
  } catch (err) {
    ctx.body = error("删除失败");
  }
};

// 审核模型
exports.reviewModel = async (ctx) => {
  try {
    const { id } = ctx.params;
    const { reviewStatus, reviewComment } = ctx.request.body;
    await Model.findByIdAndUpdate(id, {
      status: reviewStatus === "approved" ? "published" : "rejected",
      reviewComment,
      reviewTime: new Date(),
    });
    ctx.body = success("审核成功");
  } catch (err) {
    ctx.body = error("审核失败");
  }
};
