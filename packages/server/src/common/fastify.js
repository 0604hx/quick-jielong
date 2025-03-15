const { resolve } = require("node:path")
const fastify = require("fastify")
const logger = require("./logger")
const { error, success } = require('.')
const { verifyJwtToken } = require("./secret")
const { TokenExpiredError } = require("jsonwebtoken")
const { loadUser } = require("../service/CacheService")
const { Roles } = require("../fields")

/**
 *
 * @param {ServerConfig} config
 */
exports.setupApp = config=>{
    const app = fastify({logger: false, disableRequestLogging: true})

    /*
     * ==================== 添加统一异常处理 ====================
     */
    app.setNotFoundHandler((req, res)=> res.status(404).send(error(`${req.url} NOT FOUND`)))
    app.setErrorHandler((e, req, res)=>{
        let msg = typeof(e) === 'string'?e:e.message
        if(e instanceof TokenExpiredError){
            return res.status(403).send(error(`403|`+msg))
        }
        global.isDebug && console.error(e)
        logger.error(`[${req.routeOptions.url}]`, msg)
        res.status(200).send(error(msg))
    })

    app.addHook('preHandler', async (req, res)=>{
        const route = req.routeOptions.url
        if(route?.startsWith && !route.startsWith("/common/")){
            let ua = req.headers[config.secret.header] || ""
            if(!ua) return

            const auth = verifyJwtToken(ua, config.secret.jwtKey)
            let user = await loadUser(auth.id, 120*60)

            if(route.startsWith("/system/")){
                if(!(user.hasRole(Roles.ADMIN) || (config.secret.adminIds||[]).includes(user.id))){
                    logger.error(`用户#${user?.id}（IP=${req.ip}）非法访问 ${route}`)
                    return res.send(error(`非法访问`))
                }
            }

            req.user = user
        }
    })
    app.addHook('onSend', async (req, res, payload)=>{
        const route = req.routeOptions.url
        if(route?.startsWith && route.startsWith("/common/") && config.http.commonExpire>0){
            res.header('Cache-Control', 'public, max-age='+config.http.commonExpire)
        }

        //对于没有调用 Response.send 方法的路由函数，自动返回空结果
        if(payload === undefined){
            global.isDebug && logger.debug(`检测到 ${route} 处理函数返回空，自动填充 Result 对象...`)
            return JSON.stringify(success())
        }

        return payload
    })

    return app
}
