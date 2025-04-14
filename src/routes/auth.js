const express = require("express");
const router = express.Router();
const { WXBizDataCrypt } = require("../utils/WXBizDataCrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// 微信登录
router.post("/wx-login", async (req, res) => {
  try {
    const { code } = req.body;

    // 获取openid和session_key
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WX_APPID}&secret=${process.env.WX_SECRET}&js_code=${code}&grant_type=authorization_code`
    );
    const wxData = await wxRes.json();

    if (wxData.errcode) {
      return res.status(400).json({
        success: false,
        error: {
          message: "微信登录失败",
        },
      });
    }

    // 查找或创建用户
    let user = await User.findOne({ openid: wxData.openid });
    if (!user) {
      user = new User({
        openid: wxData.openid,
      });
      await user.save();
    }

    // 生成token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          openid: user.openid,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "服务器错误",
      },
    });
  }
});

// 手机号登录
router.post("/phone-login", async (req, res) => {
  try {
    const { code, encryptedData, iv } = req.body;

    // 获取session_key
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WX_APPID}&secret=${process.env.WX_SECRET}&js_code=${code}&grant_type=authorization_code`
    );
    const wxData = await wxRes.json();

    if (wxData.errcode) {
      return res.status(400).json({
        success: false,
        error: {
          message: "微信登录失败",
        },
      });
    }

    // 解密手机号
    const pc = new WXBizDataCrypt(process.env.WX_APPID, wxData.session_key);
    const data = pc.decryptData(encryptedData, iv);

    // 查找或创建用户
    let user = await User.findOne({ openid: wxData.openid });
    if (!user) {
      user = new User({
        openid: wxData.openid,
        phone: data.phoneNumber,
      });
    } else {
      user.phone = data.phoneNumber;
    }
    await user.save();

    // 生成token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          openid: user.openid,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "服务器错误",
      },
    });
  }
});

// 获取用户信息
router.get("/user-info", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: "未授权",
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "用户不存在",
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "服务器错误",
      },
    });
  }
});

module.exports = router;
