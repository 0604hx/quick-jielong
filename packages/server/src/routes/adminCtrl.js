const { success, assert } = require("../common")
const Apply = require("../db/Apply")
const Jielong = require("../db/Jielong")
const User = require("../db/User")
const { STATUS, Status, TYPE, Roles, ID, ROLE, ADD_ON } = require("../fields")
const { listJielong, delJielong } = require("../service/JielongService")
const { dashboard, saveOpLog } = require("../service/SystemService")
const { updateUser } = require("../service/UserService")
const { buildOpByWechat } = require("./common")

/**
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    app.post("/system/dashboard", async req=> success(await dashboard()))

    app.post("/system/apply-list", async req=>{
        return success(await Apply.query()
            .where({[STATUS]: Status.PENDING, [TYPE]:Apply.AUTH})
            .limit(20)
        )
    })

    app.post("/system/apply-done", async req=>{
        let { id } = req.body
        let apply = await Apply.query().findById(id)
        if(apply && apply.uid){
            //更新用户权限
            await User.query().where(ID, apply.uid).update({ role: Roles.DATA })
            await Apply.query().where({ id }).update({ status: Status.DONE })

            saveOpLog(buildOpByWechat(req, `通过 ${apply.uid} 的权限申请`, Apply.tableName))
        }
    })

    app.post("/system/apply-del", async req=>{
        await Apply.query().deleteById(req.body.id)
        saveOpLog(buildOpByWechat(req, `删除权限申请`, Apply.tableName))
    })

    app.post("/system/user-authed", async req=>{
        return success(await User.query()
            .whereNotNull(ROLE)
            .orderBy(ADD_ON)
            .limit(50)
        )
    })

    app.post("/system/user-revoke", async req=>{
        let { id } = req.body
        await updateUser(id, { role: null })
        saveOpLog(buildOpByWechat(req, `撤除用户 ${id} 的角色`, User.tableName))
    })

    app.post("/system/user-rename", async req=>{
        let { id, name } = req.body
        assert.hasText(name, `名称不能为空`)

        await updateUser(id, { name })
        saveOpLog(buildOpByWechat(req, `修改用户 ${id} 的名称为[${name}]`, User.tableName))
    })

    app.post("/system/jielong-list", async req=>{
        return success(await listJielong(req.body))
    })

    app.post("/system/jielong-del", async req=>{
        let { id } = req.body
        await delJielong(id)
        saveOpLog(buildOpByWechat(req, `删除接龙#${id}`, Jielong.tableName))
    })
}
