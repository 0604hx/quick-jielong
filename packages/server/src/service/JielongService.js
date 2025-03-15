const { assert } = require("../common")
const { datetime } = require("../common/date")
const { maskText, uuidUpper } = require("../common/tool")
const Entry = require("../db/Entry")
const Jielong = require("../db/Jielong")
const { PID, SEQ, ID, DAY } = require("../fields")
const { loadJielong } = require("./CacheService")

exports.queryById = async (id, itemToString=false)=>{
    let bean = await loadJielong(id)
    if(!bean)   return {}

    let items = await Entry.query().where(PID, id).orderByRaw(`${SEQ},${ID}`)
    if(itemToString){
        items = items.map(v=>JSON.stringify(v))
    }
    if(bean.secret){
        //脱敏处理
        items.filter(e=>e.content).forEach(e=> e.content=maskText(e.content))
    }
    bean.items = items
    return bean
}

/**
 * 新建接龙
 * @param {Jielong} bean
 * @param {Array<Entry>} entries
 */
exports.createJielong = async (bean, entries)=>{
    assert.hasText(bean.title, "标题不能为空")
    assert.isTrue(bean.mode==0 || bean.mode==1, "接龙模式有误")

    bean.id = uuidUpper(10)
    bean.title = bean.title.trim()
    bean.summary = bean.summary.trim()
    bean.addOn = Date.now()

    const trx = await Jielong.startTransaction()
    await Jielong.query(trx).insert(bean)

    if(bean.mode == Jielong.FREEDOM){
        for (let i = 0; i < entries.length; i++) {
            entries[i].pid = bean.id
            await Entry.query(trx).insert(entries[i])
        }
    }

    trx.commit()
}

/**
 * 加入接龙
 * @param {String} id
 * @param {String} uid
 * @param {String} content
 * @param {Number} seq
 */
exports.joinJielong = async (id, uid, content, seqId)=>{
    let bean = await loadJielong(id)
    if(bean.mode == Jielong.NORMAL){
        if(await Entry.count(PID, id)>=bean.quantity)
            throw `接龙人数已达上限`

        let e = new Entry()
        e.pid = id
        e.uid = uid
        e.content = content
        e.day = Date.now()

        await Entry.query().insert(e)
    }
    else{
        //尝试更新
        let result = await Entry.query()
            .where({pid: id, uid:null, id:seqId})
            .update({content, uid, day: Date.now()})
        console.debug(result)
        assert.isTrue(result==1, `FAIL`)
    }
}

/**
 * 取消接龙
 * @param {String} id
 * @param {String} uid
 */
exports.cancelJielong = async (id, uid)=>{
    let bean = await loadJielong(id)
    if(bean.mode == Jielong.NORMAL)
        await Entry.query().where({pid: id, uid}).delete()
    else
        await Entry.query().where({pid: id, uid}).update({content:null, uid:null, uname:null, day:null})
}

/**
 * 获取我参与的接龙信息
 * @param {String} uid
 * @param {Number} size
 * @param {Number} offset
 * @returns {Array<Jielong>}
 */
exports.loadJoined = async (uid, size=20, offset=0)=>{
    let entries = await Entry.query()
        .select(PID, DAY)
        .where({ uid })
        .orderBy(DAY, 'desc')
        .offset(offset).limit(size)

    let days = entries.reduce((m, e)=> {
        m[e.pid]=e.day
        return m
    }, {})
    let list = await Jielong.query().whereIn(ID, entries.map(e=>e.pid))
    list.forEach(jl=> jl.addOn = days[jl.id])

    // return list
    return list.sort((a, b)=> b.addOn - a.addOn)
}
