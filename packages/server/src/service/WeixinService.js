const { get } = require('axios')
const config = require('../config')
const logger = require('../common/logger')

const grant_type = "authorization_code"

/**
 * https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
 * @param {String} code
 * @returns {WeixinResponse}
 */
exports.code2Session = async js_code=>{
    let params = { appid: config.appId, secret: config.appSecret, js_code, grant_type }
    /**@type {{data:WeixinResponse}} */
    let { data } = await get('https://api.weixin.qq.com/sns/jscode2session', {params})
    if('errcode' in data && data.errcode != 0) {
        logger.error(`[微信API] ${data.errcode}|${data.errmsg}`)
        throw data.errmsg
    }
    if(global.isDebug) logger.debug(`[微信API] jscode2session`, data)
    return data
}
