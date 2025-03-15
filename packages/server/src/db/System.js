const { BaseAddonModel } = require("./abstract")


class OpLog extends BaseAddonModel{
    static get tableName(){ return `sys_log` }

    /**@type {String} 用户ID */
    uid     = undefined
    /**@type {String} 客户端平台 */
    platform= undefined
    /**@type {String} 设备品牌 */
    brand   = undefined
    /**@type {String} 微信版本号 */
    version = undefined
    /**@type {String} 对象 */
    mod     = undefined
    summary = undefined
}

module.exports = { OpLog }
