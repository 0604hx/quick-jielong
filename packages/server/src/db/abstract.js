const { omit } = require("lodash")
const Objection = require("objection")
const { Model } = require("objection")
const { ID } = require("../fields")

const AT    = "@"
const UNDER = "_"
const DESC  = Array.of("1", "DESC")

class BaseModel extends Model {

    id      = undefined

    /**
     * 使用 rsbuild 打包后，子类无法正常获取到表名，需要人工设置
     */
    static get tableName(){
        return this.name
    }

    /**
     * @param {Object|String|Objection.CallbackVoid<Objection.QueryBuilder>} where
     * @returns {Number}
     */
    static async count(whereObjOrCol, value, op="="){
        let result = await (whereObjOrCol == null? this.query() : value!=undefined ? this.query().where(whereObjOrCol, op, value):this.query().where(whereObjOrCol)).count()
        return result[0]['count(*)']
    }

    /**
     * 通过 QueryBuilder 函数进行查询
     * @param {Objection.CallbackVoid<Objection.QueryBuilder>} cb
     * @returns {Number}
     */
    static async countWithBuilder(cb){
        return this.count(cb)
    }

    /**
     * 按 ID 更新数据
     * @param {Object} obj
     * @param  {...String} ignores - 需要忽略的字段名称
     */
    static async updateById(obj, ...ignores){
        if(!obj.id) throw `对象没有 id 属性，不支持 updateById`
        await this.query().where({id: obj.id}).update(omit(obj, [ID, ...ignores]))
    }

    static buildQuery(form, pagination={page:1, pageSize:20}){
        let q = this.query()

        Object.keys(form||{}).forEach(k=>{
            let t = k.split(UNDER)
            if(t.length < 2)
                return

            let v = form[k]
            //(typeof(v)=='string' && v=="")
            if(v==null || v==="")    return

            let isSpecial = k.endsWith(UNDER) && !k.endsWith("__")
            switch (t[0].toUpperCase()) {
                case "LIKE":
                    if(t.length == 2)
                        q.whereLike(t[1].replaceAll(AT, UNDER), `%${v}%`)
                    else{
                        q.andWhere(b=>{
                            for (let i = 1; i < t.length; i++){
                                q.orWhere(t[i].replaceAll(AT, UNDER), 'like', `%${v}%`)
                            }
                        })
                    }
                    break
                case "EQ":
                    q.where(t[1], v)
                    break
                case "IN":
                    let vs = []
                    if(Array.isArray(v))
                        vs.push(...v)
                    else
                        vs.push(v)
                    q.whereIn(t[1], vs)
                    break
                case "LT":
                    q.where(t[1], "<", isSpecial?Number(v):v)
                    break
                case "LTE":
                    q.where(t[1], "<=", isSpecial?Number(v):v)
                    break
                case "GT":
                    q.where(t[1], ">", isSpecial?Number(v):v)
                    break
                case "GTE":
                    q.where(t[1], ">=", isSpecial?Number(v):v)
                    break
                case "NE":
                    q.whereNot(t[1], isSpecial?Number(v):v)
                    break
                case "SORT":
                    q.orderBy(t.slice(1).join(","), DESC.includes(v.toString())?"DESC":"ASC")
                    break
                default:
                    break
            }
        })

        if(Array.isArray(pagination.columns) && pagination.columns.length)
            q.columns(...pagination.columns)
        return q
    }

    /**
     * 分页查询
     * @param {Object} form
     * @param {Pagination} pagination
     * @param {Function} transfer
     * @returns {PageResult}
     */
    static async pageSelect(form, pagination={page:1, pageSize:20}, transfer){
        let q = this.buildQuery(form, pagination)

        let result = await q.page((pagination.page??1)-1, pagination.pageSize)
        if(transfer && typeof(transfer) == 'function'){
            for (let i = 0; i < result.results.length; i++) {
                await transfer(result.results[i])
            }
        }
        return result
    }
}

class BaseAddonModel extends BaseModel {
    addOn   = undefined
}

module.exports = { BaseModel, BaseAddonModel }
