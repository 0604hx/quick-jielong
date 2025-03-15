const { date, datetime } = require('../../utils/date')
const { RESULT } = require('../../utils/http')
const { buildEntryPrefixs, checkRoleOfData } = require('../../utils/tool')
const { warn, ok } = require('../../utils/util')

Page({
    data: {
        id: undefined,
        title:"",
        day:"",
        summary:"",
        mode: 0,
        quantity: 15,
        secret: false,
        expire: undefined,

        entries: [],
        loading: false,
        authed: false,

        prefix: "",
        expireText: undefined,
        dateShow: false,
        expireShow: false,
        expireDate: 0,

        showTip: false,
    },
    onLoad (){
        this.setData({ authed: checkRoleOfData()})
    },
    toCreate (){
        if(this.data.id)        return warn(`不能重复创建`)

        let { title, mode, entries, quantity, day, summary, secret, expire } = this.data
        if(!title)              return warn(`标题不能为空`)
        if(mode==null)          return warn(`请选择接龙模式`)
        if(mode==1){
            if(entries.length==0) 
                return warn(`还没创建条目噢`)
            quantity = entries.length
        }

        let bean = { title, day, mode, quantity, summary, secret, expire }
        this.setData({loading:true})
        RESULT(
            "/create", 
            { bean, entries }, 
            d=>{
                ok(`接龙已创建`)
                this.setData({ id: d.data, loading:false })

                let { id, title, day } = this.data
                wx.redirectTo({ url:`/pages/create/success?id=${d.data}&title=${title}&day=${day}` })
            }, 
            ()=> this.setData({loading: false})
        )
    },
    onQuantity(e){
        this.setData({ quantity: e.detail.value })
    },
    toDate (){
        this.setData({ curDate: this.data.day? new Date(this.data.day).getTime():Date.now(), dateShow: true})
    },
    onDate (e){
        if(e.type == 'confirm') {
            this.setData({day: date(e.detail), dateShow:false})
            return
        }
        this.setData({ dateShow: false })
    },
    onSecret (e){
        this.setData({ secret: e.detail.value })
    },
    onMode (e){
        this.setData({ mode: e.detail.value })
    },
    toExpire (){
        this.setData({ expireDate: this.data.exipre||Date.now(), minDate: Date.now(), expireShow: true })
    },
    onExpire (e){
        if(e.type == 'change') {
            let expire = e.detail.value
            let notSet = expire <= Date.now()
            this.setData({ expire: notSet? undefined: expire, expireText: notSet?undefined: datetime(expire), expireShow:false})
            if(notSet){
                warn(`截止日期无效`)
            }
            return
        }
        this.setData({ expireShow: false })
    },
    prefixClick (e){
        this.setData({ showTip: !this.data.showTip })
    },
    buildEntries (){
        console.debug(this.data.quantity)
        let prefixs = buildEntryPrefixs(this.data.prefix, this.data.quantity)
        let entries = prefixs.map((prefix, i)=>({ seq: i+1, prefix }))
        this.setData({ entries })
    },
    /**
     * 更新前缀
     * @param {*} e 
     */
    updatePrefix (e){
        let { index } = e.currentTarget.dataset
        let { entries } = this.data
        entries[index].prefix = e.detail.value
        this.setData({ entries })
    },
    /**
     * 删除指定位置的条目
     * @param {*} e
     */
    delEntry (e){
        let { index } = e.currentTarget.dataset
        console.debug(index, e.currentTarget.dataset)
        let { entries } = this.data
        entries.splice(index, 1)
        for (let i = index; i < entries.length; i++) {
            entries[i].seq = i+1
        }
        this.setData({ entries })
    }
})