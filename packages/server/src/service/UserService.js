const Objection = require("objection")
const logger = require("../common/logger")
const User = require("../db/User")

/**
 * 创建新用户
 * @param {String} id
 * @returns {User}
 */
exports.createUser = async id=>{
    if(await User.count({id}) == 0){
        let user = new User()
        user.id = id
        user.name = `NO.${await User.count()+1}`
        user.addOn = Date.now()

        await User.query().insert(user)
        logger.info(`创建新用户 ID=${id} NAME=${user.name}`)
    }

    return { id }
}

/**
 * 更新用户信息
 * @param {String} id
 * @param {Objection.PartialModelObject<User>} update
 */
exports.updateUser = async (id, update={})=>{
    await User.query().where({ id }).update(update)
}
