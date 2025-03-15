const { datetime } = require("../../utils/date")
const { RESULT } = require("../../utils/http")
const { buildDetailShare } = require("../../utils/tool")
const { ok, warn, showConfirm } = require("../../utils/util")

const uid = getApp().globalData.uid

Page({
    data: {
        showHome: getCurrentPages().length == 0,
        loading: true,
        uid,
        bean: {},
        items: [],
        joined: false,
        tip:"",
        canJoin: false,
        text: undefined
    },
    onShareAppMessage (){
        let { day, title, id } = this.data.bean
        return buildDetailShare(id, title, day)
    },
    updateBean (bean){
        let text = undefined
        let items = []
        let joined = false
        if(bean.id){
            items = bean.items??[]
            if(bean.mode==0 && bean.quantity<=items.length)
                text = "已达人数上限"
            if(bean.expire){
                bean.expire = datetime(bean.expire)
                if(Date.now()>=bean.expire)
                    text = "已结束"
            }
            if(bean.addOn)  bean.addOn = datetime(bean.addOn)
            delete bean.items
            joined = items.some(v=>v.uid==uid)
            if(!joined && !text && bean.mode==0)
                items.push({seq: items.length+1})
        }
        this.setData({ loading:false, bean, text, items, joined, tip:joined?"":"请输入接龙信息" })
    },
    onLoad ({ id }){
        this.setData({ loading: true, showHome: getCurrentPages().length<=1})
        RESULT(`/detail-${id}`, {}, d=>this.updateBean(d.data))
    },
    afterDeal (obj){
        getApp().globalData.refresh = true
        obj && this.onLoad(obj)
    },
    copyID (){
        wx.setClipboardData({
            data: this.data.bean.id,
            success: ()=> ok(`接龙ID已复制`)
        })
    },
    onInput (e){
        let { items, bean } = this.data
        let { index } = e.currentTarget.dataset
        items[index].content = (e.detail.value||"").trim()
        if(bean.mode == 1){
            //清空其他输入
            items.filter((v,i)=>i!=index && !v.uid).forEach(v=>v.content=undefined)
        }
        this.setData({ items })
    },
    joinDo (e){
        let { items, bean } = this.data
        let entry = items[e.currentTarget.dataset.index]
        if(entry.content?.trim()){
            RESULT(
                "/join",
                { id:bean.id, value:entry.content, eid: entry.id },
                d=>{
                    entry.uid = uid
                    this.setData({ items, joined: true, tip:'' })
                    ok(`接龙成功`)
                    this.afterDeal()
                },
                ()=>{
                    showConfirm(
                        `接龙参与失败`,
                        `很可能是位置已被他人选中，是否刷新后再来一次？`,
                        ()=>this.onLoad(bean)
                    )
                    return true
                }
            )
        }
        else
            warn(`请输入信息`)
    },
    toCancel (e){
        let { bean } = this.data
        showConfirm(`操作确认`, `取消接龙 ⌈${bean.title}⌋ 吗？`, ()=>{
            RESULT("/cancel", { id: bean.id }, d=>{
                ok(`取消成功`)
                this.afterDeal(bean)
            })
        })
    },
    onBackFail (e){
        //跳转到首页
        wx.redirectTo({ url: '/pages/index/index' })
    }
})
