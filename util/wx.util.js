const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');

let myConfig;
let myData;

module.exports.initData = function () {
    const configPath = path.join(__dirname, '..', 'data', 'wx.config.db.json');
    myConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const dataPath = path.join(__dirname, '..', 'data', 'wx.data.db.json');
    let tempData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    myData = Object.assign({ expiresIn: 0, menuTime: 0 }, tempData);
    fs.watchFile(configPath, (cur, prv) => {
        myConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        createMenu();
    });
    createMenu();
}

function getTextMsg(toUser, fromUser, content) {
    return `<xml><ToUserName><![CDATA[${fromUser}]]>
    </ToUserName><FromUserName><![CDATA[${toUser}]]></FromUserName>
    <CreateTime>${new Date().getTime()}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content></xml>`;
}

module.exports.getKeyWordsMsg = function (toUser, fromUser, msg) {
    msg = msg.toLowerCase();
    const isletter = /^[a-zA-Z]+$/.test(msg);
    let content;
    if (isletter) {
        content = myConfig.keyWords[msg];
        if (null == content) {
            for (let key in myConfig.keyWords) {
                if (msg.indexOf(key) >= 0 || key.indexOf(msg) >= 0) {
                    content = myConfig.keyWords[key];
                    break;
                }
            }
        }
        if (null == content) {
            content = '公众号正在完善中';
        }
    }
    if (null == content) {
        content = '号主正在查看你的消息';
    }
    return getTextMsg(toUser, fromUser, content);
}

module.exports.getSubscribeMsg = function (toUser, fromUser) {
    return getTextMsg(toUser, fromUser, myConfig.subscribeMsg);
}

module.exports.getOtherMsg = function (toUser, fromUser) {
    return getTextMsg(toUser, fromUser, '号主正在查看你消息');
}

module.exports.getA

function getToken() {
    let curTime = new Date().getTime();
    if (curTime < myData.expiresIn) {
        return Promise.resolve(myData.accessToken);
    }
    return new Promise((resolve, reject) => {
        axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${wxConfig.wxAppId}&secret=${wxConfig.wxAppSecret}`).then(response => {
            if (response.status == 200) {
                myData.accessToken = response.data.access_token;
                myData.expiresIn = curTime + (response.data.expires_in || 0) * 1000;
                resolve(myData.accessToken);
                saveWxData();
            }
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
}

async function createMenu() {
    if (myData.menuTime < myConfig.menuTime) {
        let token = await getToken();
        axios.post(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`, myConfig.menu).then((response) => {
            if (response.data.errcode == 0) {
                myData.menuTime = myConfig.menuTime;
                saveWxData();
            }
        }).catch((error) => {
            console.log('createMenu error', error);
        });
    }
}

function saveWxData() {
    const dataPath = path.join(__dirname, '..', 'data', 'wx.data.db.json');
    fs.writeFileSync(dataPath, JSON.stringify(myData), { encoding: 'utf8' });
    createMenu();
}