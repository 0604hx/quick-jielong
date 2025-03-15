const { OpLog } = require("../db/System")

const headerNames = ['brand', 'platform', 'version']

/**
 *
 * @param {import("fastify").FastifyRequest} req
 * @param {String} summary
 * @param {String} mod
 * @returns {OpLog}
 */
exports.buildOpByWechat = (req, summary, mod="")=>{
    let op = { mod, summary }
    headerNames.forEach(v=> op[v]=req.headers[v])
    op.uid = req.user?.id

    return op
}
