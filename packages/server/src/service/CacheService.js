const cache = require('../common/cache')
const { wrap } = require("../common")
const logger = require("../common/logger")
const User = require('../db/User')
const { createUser } = require('./UserService')
const Jielong = require('../db/Jielong')

const defaultExpire = 120*60

/**
 *
 * @param {String} key - 缓存ID
 * @param {Function} creater - 构建函数
 * @param {Number} exire - 超时，单位秒，默认两小时
 */
const withCache = async (key, creater, expire=defaultExpire)=>{
    if(cache.has(key)){
        // if(global.isDebug)  logger.debug(`[CACHE] 使用缓存 ${key}`)
        return cache.get(key)
    }
    const data = await creater()
    return cache.set(key, data, expire)
}

exports.withCache = withCache

/**
 * 获取当前登录用户
 * @param {String} id
 * @param {Number} expire
 * @returns {User}
 */
exports.loadUser = async (id, expire=defaultExpire)=> withCache(
    `user.${id}`,
    async ()=>{
        const user = await User.query().findById(id)
        if(!!user)
            return user

        //如果不存在则自动创建
        if(!!id){
            await createUser(id)
            logger.info(`自动创建用户 ${id}`)
            return await User.query().findById(id)
        }
        return null
    },
    expire
)

exports.clearJielong = id=> cache.clear(`jielong.${id}`)

/**
 * 加载接龙对象
 * @param {String} id
 * @returns {Jielong}
 */
exports.loadJielong = async id=> withCache(
    `jielong.${id}`,
    ()=> Jielong.query().findById(id)
)
