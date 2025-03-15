const { success, D, assert } = require("../common")
const { createJwtToken } = require("../common/secret")
const { uuidUpper } = require("../common/tool")
const config = require("../config")
const Entry = require("../db/Entry")
const Jielong = require("../db/Jielong")
const { createUser } = require("../service/UserService")
const { code2Session } = require("../service/WeixinService")
const { saveOpLog } = require("../service/SystemService")
const User = require("../db/User")
const { queryById, createJielong, joinJielong, cancelJielong, loadJoined } = require("../service/JielongService")
const { ADD_ON, TITLE, PID, ID, DAY, Roles, Status, SUMMARY } = require("../fields")
const { clearJielong } = require("../service/CacheService")
const adminCtrl = require("./adminCtrl")
const Apply = require("../db/Apply")
const { buildOpByWechat } = require("./common")

const PAGESIZE = 20

/**
 *
 * @param {String} id
 * @param {String} uid
 * @returns {Jielong}
 */
const loadJielong = async (id, uid="")=>{
    let bean = await Jielong.query().where({ id, uid }).first()
    if(!bean)   throw `接龙不存在或者未授权`

    return bean
}

/**
 *
 * @param {import("fastify").FastifyInstance} app
 */
module.exports = app=>{
    adminCtrl(app)

    app.route({
        method:['GET', 'POST'],
        url:"/common/status",
        handler: ()=> success(parseInt(process.uptime()))
    })

    app.post("/common/login", async req=>{
        let { code } = req.body
        let wxData = await code2Session(code)

        let user = await createUser(wxData.openid)
        let value = createJwtToken(
            user,
            config.secret.jwtKey,
            { expiresIn: config.secret.jwtExpire+"d" }
        )
        let expire = Date.now() + config.secret.jwtExpire*24*60*60*1000

        let op = buildOpByWechat(req, `从${req.ip}登录`, User.tableName)
        op.uid = user.id
        saveOpLog(op)
        return success({expire, value, id: user.id})
    })

    app.post("/create", async req=>{
        assert.hasText(req.user?.id, `请先登录`)
        assert.isTrue(req.user.hasRole(Roles.ADMIN, Roles.DATA), `未授权`)

        /**@type {{bean:Jielong, entries:Array<Entry>}} */
        let { bean, entries } = req.body

        bean.uid = req.user.id
        await createJielong(bean, entries)

        saveOpLog(buildOpByWechat(req, `创建接龙 ${bean.id}/${bean.title}（条目${entries.length}个）`, Jielong.tableName))
        return success(bean.id)
    })

    app.post("/overview", async req=>{
        let { id:uid, role } = req.user
        return success({ list: await loadJoined(uid), role })
    })

    app.post("/list", async req=>{
        /**@type {{mode:Number, keyword:String, offset:Number}} */
        let { mode, keyword, offset=0 } = req.body
        let uid = req.user.id
        if(mode == 1){
            //我参与的
            return success(await loadJoined(uid, PAGESIZE, offset))
        }
        else{
            //我发起的
            let q = Jielong.query().where({uid})
            if(keyword && keyword.trim())
                q.whereLike(TITLE, `%${keyword}%`)
            q.orderBy(ADD_ON, 'DESC')
            q.offset(offset).limit(PAGESIZE)
            // q.page(Math.floor(offset/PAGESIZE), PAGESIZE)

            return success(await q)
        }
    })

    app.post("/detail-:id", async req=>{
        let { id } = req.params
        return success(await queryById(id))
    })

    app.post("/copy", async req=>{
        /**@type {{id:String, update:Boolean, data:Boolean, del:Boolean}} */
        let { id, update, data, del, title } = req.body
        let bean = await loadJielong(id, req.user?.id)
        let items = await Entry.query().where(PID, id)

        bean.id = uuidUpper(10)
        bean.addOn = Date.now()
        if(update && bean.day){
            bean.day = D.date()
        }
        if(title && title.trim())
            bean.title = title

        const trx = await Jielong.startTransaction()
        await Jielong.query(trx).insert(bean)

        for(let i=0;i<items.length;i++){
            let e = items[i]
            e.id = undefined
            e.pid       = bean.id

            if(!data){
                e.uid       = undefined
                e.uname     = undefined
                e.content   = undefined
                e.day       = undefined
            }
            await Entry.query(trx).insert(e)
        }

        if(del){
            //删除旧数据
            await Jielong.query(trx).deleteById(id)
            clearJielong(id)
        }
        trx.commit()

        saveOpLog(buildOpByWechat(req, `复制接龙 ${id} >> ${bean.id}/${bean.title}`, Jielong.tableName))
    })

    app.post("/del", async req=>{
        let { id } = req.body
        let bean = await loadJielong(id, req.user?.id)

        await Jielong.query().deleteById(id)
        clearJielong(id)

        await Entry.query().where(PID, id).delete()
        saveOpLog(buildOpByWechat(req, `删除接龙${bean.id}/${bean.title}`, Jielong.tableName))
    })

    app.post("/modify", async req=>{
        let { id, field, value } = req.body

        if(![TITLE, SUMMARY].includes(field)){
            throw `无效的修改类型：${field}`
        }

        let bean = await loadJielong(id, req.user?.id)
        await Jielong.query().where({ id }).update({ [field]: value })
        clearJielong(id)

        saveOpLog(buildOpByWechat(req, `修改接龙 ${id} 的[${field}]为${value}`))
    })

    app.post("/join", async req=>{
        assert.hasText(req.user?.id, `请先登录`)

        /**@type {{id:String, value:String, seq:Number}} */
        let { id, value, eid } = req.body

        await joinJielong(id, req.user.id, value, eid)
        saveOpLog(buildOpByWechat(req, `参与接龙[${id}] ${value}`, Jielong.tableName))
    })

    app.post("/cancel", async req=>{
        let { id } = req.body
        await cancelJielong(id, req.user.id)
        saveOpLog(buildOpByWechat(req, `取消接龙 ${id}`, Jielong.tableName))
    })

    app.post("/apply-auth", async req=>{
        let { id: uid } = req.user

        /**@type {Apply} */
        let bean = { uid }
        bean.status = Status.PENDING
        bean.type = Apply.AUTH
        bean.addOn = Date.now()
        await Apply.query().insert(bean)

        saveOpLog(buildOpByWechat(req, `申请接龙权限`, User.tableName))
    })
}
