const { RESULT, updateToken } = require("./utils/http")
const { showError, isDev } = require("./utils/util")

const TOKEN = "token"

/**
 * @typedef {Object} TokenBean
 * @property {String} id - 用户ID
 * @property {String} value - 内容
 * @property {Number} expire - 过期
 */

const doWithLogin = ()=>{
    wx.login({success: res=>{
        //发送 res.code 到后台换取 openId, sessionKey, unionId
        RESULT("/common/login", { code: res.code }, d=>{
            /**@type {{data:TokenBean}}*/
            let { data } = d
            if(data.value && data.expire> Date.now()){
                wx.setStorageSync(TOKEN, data)
                updateToken(data.value)
            }
            else{
                showError(`后端返回数据格式有误`,`微信自动登录失败`)
            }
        })
    }})
}

App({
    /**
     * 执行登录，流程：
     * 1. 判断本地储存的 token 是否过期
     * 2. 若不过期则继续使用，跳转到 4
     * 3. 若过期则通过 wx.login 获取 code 实现注册及登录，从后端拿到 token
     * 4. 设置请求 token、全局UID
     */
    onLaunch() {
        /**@type {TokenBean} */
        let t = wx.getStorageSync(TOKEN)

        if(!t || t.expire<Date.now())  
            return doWithLogin()
        
        this.globalData.uid = t.id
        updateToken(t.value)
    },
    globalData: {
        uid: undefined,
        version:  isDev? "DEV" : "v25.3.20",
        author: "集成显卡",
        appName:"快接龙",
    }
})
