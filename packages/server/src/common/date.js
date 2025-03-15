const dayjs = require('dayjs')

const YMD = "YYYY-MM-DD"
const HMS = "HH:mm:ss"

let formmat = (d=Date(), f=YMD)=> dayjs(d).format(f)

exports.year        = (d=Date())=> formmat(d, "YYYY")
exports.date        = (d=Date(), f=YMD)=> formmat(d, f)
exports.time        = (d=Date())=> dayjs(d).format(HMS)
exports.datetime    = (d=Date(), f=`${YMD} ${HMS}`)=> formmat(d, f)
/**
 * 日期增减
 * @param {Number} step - 增幅，默认 1
 * @param {Date} d - 容器对象
 * @param {String} key - 默认为 day
 * @returns {String}
 */
exports.addDay      = (step=1, d=Date(), key="day")=> dayjs(d).add(step, key).format(YMD)
exports.dayjs       = dayjs
