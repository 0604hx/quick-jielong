const { isDev, showError } = require("./util")

// const baseURL = "https://jielong.0604hx.top"
const baseURL = isDev ? "http://localhost:10002" : "https://jielong.0604hx.top"
let header = (()=>{
    let d = wx.getDeviceInfo()
    return { token:"", brand: d.brand, platform: d.platform, version: wx.getAppBaseInfo().version }
})();


/**
 *
 * @param {String} value
 */
exports.updateToken = value=> header.token = value || ""

exports.RESULT = (target, data, onOk, onFail) => {
    let url = `${baseURL}${target}`
    if(isDev)   console.debug(`发起请求`, url)

    wx.request({
        url,
        method: 'POST',
        data,
        header,
        success: ({ data, statusCode }) => {
            if(statusCode == 200 && data.success == true){
                onOk && onOk(data)
            }
            else{
                //当自定义了异常处理函数，就优先调用，当 onFail 返回 true 时不显示系统级别的错误提示
                let notShowError = onFail && onFail(data)===true
                if(!notShowError){
                    let msg = data.message == 'invalid signature'?"无效的TOKEN（可清理缓存后再试）":data.message
                    showError(msg, `请求出错`)
                }
            }
        },
        fail: e => {
            console.error(`请求异常`, e)
            let notShowError = onFail && onFail(data)===true
            if(!notShowError){
                showError(e.errMsg, `请求失败`)
            }
        }
    })
}
