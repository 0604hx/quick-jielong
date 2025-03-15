const { BaseAddonModel } = require("./abstract")

module.exports = class User extends BaseAddonModel{
    static get tableName() { return `user` }

    /**@type {String} 唯一编号，通常采用微信的用户ID */
    id      = undefined
    /**@type {String} */
    name    = undefined
    /**@type {String} 角色 */
    role    = undefined

    /**
     * 判断是否具备相应的权限
     * @param  {...any} roleNames
     * @returns {Boolean}
     */
    hasRole (...roleNames){
        return roleNames.some(n=>this.role == n)
    }
}
