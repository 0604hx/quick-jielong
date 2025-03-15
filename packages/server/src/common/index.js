const DateTool = require("./date")

/**
 *
 * @param {*} data
 * @param {String} message
 * @returns
 */
const success = (data, message)=>({data, message, success:true})
/**
 *
 * @param {String} message
 * @param {*} data
 * @returns
 */
const error   = (message, data)=>({data, message, success:false})

exports.error       = error
exports.success     = success

exports.D = DateTool

/**
 *
 */
exports.assert = {
    hasText: (o, msg)=> {
        if(typeof(o) != 'string' || o.trim().length==0)
            throw msg || "参数不能为空"
    },
    isTrue: (o, msg)=> {
        if(o != true)
            throw msg || "表达式校验不通过"
    },
    isDBObj: (o, msg)=>{
        if(o && typeof(o)=='object' && o.id)    return
        throw msg || `数据对象不存在或有误`
    }
}

/**
 * 包裹文本
 * @param {String} text
 * @returns
 */
exports.wrap = text=> `⌈${text}⌋`
