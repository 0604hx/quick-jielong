const { BaseAddonModel } = require("./abstract");

module.exports = class Jielong extends BaseAddonModel{
    static get tableName() { return `jielong` }

    static NORMAL = 0
    static FREEDOM= 1

    /**@type {String} 发起人ID */
    uid     = undefined
    /**@type {String} 标题 */
    title   = undefined
    /**@type {String} 日期 */
    day     = undefined
    /**@type {String} 描述信息 */
    summary = undefined
    /**@type {Number} 接龙条目上限 */
    quantity= undefined
    /**@type {Number} 接龙方式：0=按顺序，1=自由选座 */
    mode    = undefined
    /**@type {Boolean} 是否脱敏 */
    secret  = undefined
    /**@type {Number} 过期 */
    expire  = undefined
}
