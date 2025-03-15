const { BaseModel } = require("./abstract");

module.exports = class Entry extends BaseModel {
    static get tableName() { return 'entry' }

    /**@type {String} 接龙ID */
    pid     = undefined
    /**@type {String} 用户ID */
    uid     = undefined
    /**@type {String} 用户名 */
    uname   = undefined
    /**@type {Number} 序号 */
    seq     = undefined
    /**@type {String} 前缀 */
    prefix  = undefined
    /**@type {String} 填报信息 */
    content = undefined
    /**@type {Number} 参与日期 */
    day     = undefined
}
