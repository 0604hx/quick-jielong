const { BaseAddonModel } = require("./abstract");

module.exports = class Apply extends BaseAddonModel {
    static get tableName() { return `apply` }

    static AUTH     = "auth"

    uid     = undefined
    type    = undefined
    status  = undefined
}
