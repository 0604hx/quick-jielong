const { datetime } = require("../../utils/date")
const { RESULT } = require("../../utils/http")
const { checkRoleOfData } = require("../../utils/tool")
const { showConfirm, ok, showInput } = require("../../utils/util")

let curId = ""

Page({
    data: {
        mine: true,
        simple: false,
        keyword:"",
        offset:0,
        loading: true,
        beans: [],

        title: "",

        showCopy: false,
        copyUpdate: true,
        copyData: false,
        copyDel: false
    },
    onLoad (options){
        if(!checkRoleOfData())
            return wx.redirectTo({ url: '/pages/other/about' })

        const mode = options.mode
        this.setData({ mine: !mode || mode=='mine' })
        this.loadData()
    },
    loadData (){
        let { mine, keyword, offset } = this.data
        this.setData({ loading: true })
        RESULT(
            "/list", 
            { mode: mine?0:1, keyword, offset }, 
            d=>{
                if(Array.isArray(d.data)){
                    d.data.forEach(b=>{
                        if(typeof(b.addOn) == 'number')
                            b.addOn = datetime(b.addOn, "MM-DD HH:mm")
                    })
                }
                this.setData({ beans: d.data, loading: false })
            }, 
            ()=> this.setData({ loading: false })
        )
    },
    toDetail (e){
        let { id } = e.currentTarget.dataset
        wx.navigateTo({ url:`/pages/view/detail?id=${id}`})
    },
    toCreate (){
        wx.navigateTo({ url:"/pages/create/create" })
    },
    toCopy (e){
        let { index } = e.currentTarget.dataset
        let b = this.data.beans[index]
        curId = b.id
        this.setData({ title: b.title })
        this.openCopy()
    },
    openCopy (){
        this.setData({ showCopy: !this.data.showCopy })
    },
    onCopyUpdate (e){
        this.setData({ copyUpdate: e.detail.value })
    },
    onCopyData (e){
        this.setData({ copyData: e.detail.value })
    },
    onCopyDel (e){
        this.setData({ copyDel: e.detail.value })
    },
    copyDo (){
        let { copyUpdate, copyData, copyDel, title } = this.data

        RESULT("/copy", { id:curId, update: copyUpdate, data: copyData, del: copyDel, title }, d=>{
            ok(`接龙信息已复制`)
            this.setData({ offset: 0, showCopy: false })
            this.loadData()
        })
    },
    toModifyTitle (e){
        let { index } = e.currentTarget.dataset
        let { beans } = this.data
        let { title, id } = beans[index]
        
        showInput(`修改标题`, title, value=>{
            RESULT("/modify", { id, value, field:"title"}, d=>{
                beans[index].title = value
                this.setData({ beans })
                ok(`标题修改完成`)
            })
        })
    },
    toDel (e){
        let { index } = e.currentTarget.dataset
        let { beans, title } = this.data
        showConfirm(
            `删除确认`, 
            `删除接龙⌈${beans[index].title}⌋吗？`, 
            ()=> RESULT("/del", {id:beans[index].id, title}, ()=>{
                beans.splice(index, 1)
                this.setData({ beans  })
            }
        ))
    }
})