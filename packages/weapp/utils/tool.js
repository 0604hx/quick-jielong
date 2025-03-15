const dayjs = require("dayjs")

const YMD = "YYYY-MM-DD"
const YMDHm = "YYYY-MM-DD HH:mm"

const imageUrl = '/assets/share-img.jpg'

/**
 * 生成条目前缀，支持自增长
 * 递增格式：A(+BC)D
 *  A 是一个以数字结尾的字符串
 *  B 是一组数值
 *  C 是一个小写字母，如 m（分钟）、h（时）、d（天）
 *
 * 普通文本递增
 *  输入：第1(+1)排
 *  结果：第1排、第2排、第3排 ...
 *
 * 时间序列递增
 *  从10:00开始每隔半小时
 *      输入：10:00(+30m)
 *      结果：10:00、10:30、11:00
 *  从10:00开始每隔2小时
 *      输入：10:00(+2h)
 *      结果：10:00、12:00、14:00
 *  从2025-01-01开始每隔一天
 *      输入：2025-01-01(+1d)
 *      结果：2025-01-01、2025-01-02、2025-01-03
 *
 * 使用示例（时间序列请在 https://day.js.org/ 下测试）：
 *  buildEntryPrefixs("10:00(+30m)")
 *  buildEntryPrefixs("2025(+1)年")
 *
 * @param {String} text - 文本
 * @param {Number} size - 数量
 * @returns {Array<String>}
 */
exports.buildEntryPrefixs = (text, size=15)=>{
    let items = new Array(size).fill(text)
    //判断是否递增
    const m = text.match(/^(.*\d)\(\+(\d+)([^\d)]*)\)(.*)$/)
    if(m){
        let A = m[1]
        let B = parseInt(m[2])
        let C = m[3]
        let D = m[4]

        let timeFlags = { m: YMDHm, h:YMDHm, d:YMD }

        //判断是否为时间
        if(Object.keys(timeFlags).includes(C)){
            let from = A.match(/([0-9:-]+)/g)[0]
            let format = timeFlags[C]
            /**
             * 计算时间
             * 在微信小程序中，同样的代码无法正常计算出时间，只能采用下方的方法
             */
            if(C=='m' || C=='h'){
                from = `2025-01-01 ${from}`
                format = "HH:mm"
            }
            let prefix = A.substring(0, A.indexOf(from))
            for(let i=0;i<size;i++){
                items[i] = `${prefix}${dayjs(from, timeFlags[C]).add(i*B, C).format(format)}${D}`
            }
        }
        else{
            //普通递增
            let from = A.match(/([0-9]+)/g)[0]
            let prefix = A.substring(0, A.indexOf(from))
            from = parseInt(from)
            for(let i=0;i<size;i++){
                items[i] = `${prefix}${from+i*B}${D}`
            }
        }
    }
    return items
}

exports.shareImageUrl = imageUrl

/**
 * 创建分享卡片信息
 * @param {String} id 
 * @param {String} title 
 * @param {String} day
 * @returns {Object} 
 */
exports.buildDetailShare = (id, title, day)=>{
    return {
        title: `${title}${day?`·${day}`:""}`,
        path: `/pages/view/detail?id=${id}`,
        imageUrl
    }
}

const ROLE_ADMIN    = "ADMIN"
const ROLE_DATA     = "DATA"
const ROLE          = "role"

exports.ROLE_ADMIN  = ROLE_ADMIN
exports.ROLE_DATA   = ROLE_DATA

exports.saveRole = role=>{
    wx.setStorageSync(ROLE, role)
}

/**
 * 判断是否有数据权限
 * @returns {Boolean}
 */
exports.checkRoleOfData = ()=>{
    let role = wx.getStorageSync(ROLE)
    return ROLE_ADMIN == role || ROLE_DATA == role
}