var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var wxUtil = require('./../util/wx.util');
var parseString = require('xml2js').parseString;

router.get('/', function (req, res, next) {

	var signature = req.query.signature;
	var timestamp = req.query.timestamp;
	var nonce = req.query.nonce;
	var echostr = req.query.echostr;

	/*  加密/校验流程如下： */
	//1. 将token、timestamp、nonce三个参数进行字典序排序
	var array = new Array(wxConfig.wxToken, timestamp, nonce);
	array.sort();
	var str = array.toString().replace(/,/g, "");

	//2. 将三个参数字符串拼接成一个字符串进行sha1加密
	var sha1Code = crypto.createHash("sha1");
	var code = sha1Code.update(str, 'utf-8').digest("hex");

	//3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
	if (code === signature) {
		res.send(echostr)
	} else {
		res.send("error");
	}
});


router.post("/", (req, res) => {
	var buffer = [];
	req.on('data', function (data) {
		buffer.push(data);
	});
	req.on('end', function () {
		var msgXml = Buffer.concat(buffer).toString('utf-8');
		parseString(msgXml, { explicitArray: false }, (err, result) => {
			if (err) {
				throw err;
			}
			result = result.xml;
			var toUser = result.ToUserName;
			var fromUser = result.FromUserName;
			if (result.MsgType === "text") {
				let msg = wxUtil.getKeyWordsMsg(toUser, fromUser, result.Content);
				res.send(msg);
			} else if (result.MsgType === "image") {
				res.send(wxUtil.getOtherMsg(toUser, fromUser, '号主正在回复中...'));
			} else if ('event' === result.MsgType) {
				if ('subscribe' === result.Event) {
					res.send(wxUtil.getSubscribeMsg(toUser, fromUser));
				}
			}
		})
	})
});

module.exports = router;
