const crypto = require("crypto");

class WXBizDataCrypt {
  constructor(appId, sessionKey) {
    this.appId = appId;
    this.sessionKey = sessionKey;
  }

  decryptData(encryptedData, iv) {
    // base64 decode
    const sessionKey = Buffer.from(this.sessionKey, "base64");
    const encryptedDataBuf = Buffer.from(encryptedData, "base64");
    const ivBuf = Buffer.from(iv, "base64");

    try {
      // 解密
      const decipher = crypto.createDecipheriv(
        "aes-128-cbc",
        sessionKey,
        ivBuf
      );
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      const decoded = decipher.update(encryptedDataBuf, "binary", "utf8");
      const decoded2 = decoded + decipher.final("utf8");

      const decrypted = JSON.parse(decoded2);

      if (decrypted.watermark.appid !== this.appId) {
        throw new Error("Illegal Buffer");
      }

      return decrypted;
    } catch (err) {
      throw new Error("Illegal Buffer");
    }
  }
}

module.exports = WXBizDataCrypt;
