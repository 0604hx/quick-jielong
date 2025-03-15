const { datetime } = require("../../utils/date")
const { RESULT } = require("../../utils/http")

import ActionSheet from 'tdesign-miniprogram/action-sheet/index'
import { ok, showConfirm } from '../../utils/util'
import { ROLE_ADMIN, ROLE_DATA, saveRole } from '../../utils/tool'

const app = getApp()
const { appName, author, version } = app.globalData

Page({
    data: {
        appName,
        footer: `${version} · BY ${author}`,
        loading: true,
        fail: false,
        role: "",
        beans:[],

        show: false,
        actions:[]
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if(app.globalData.uid) return this.loadData()

        setTimeout(this.loadData, 1000)
    },
    onShow (){
        if(app.globalData.refresh==true){
            this.loadData()
            console.debug("刷新首页数据...")
            app.globalData.refresh = false
        }
    },
    onShareAppMessage(){
        return {
            title: appName,
            imageUrl: shareImageUrl
        }
    },
    loadData (){
        RESULT(
            "/overview",  { },
            d=>{
                let { list:beans, role } = d.data
                if(Array.isArray(beans)){
                    beans.forEach(b=>{
                        if(typeof(b.addOn) == 'number')
                            b.addOn = datetime(b.addOn, "MM-DD HH:mm")
                    })
                }
                let actions = []
                if(role == ROLE_ADMIN || role == ROLE_DATA){
                    actions.push({ label:"发起接龙", url: '/pages/create/create'})
                    actions.push({ label:"我发起的", subname:"历史发起的接龙", url:'/pages/view/list' })
                }
                if(role == ROLE_ADMIN) actions.push({ label:"仪表盘", subname:"查看总览数据", url:'/pages/admin/dashboard' })
                if(actions.length==0){
                    actions.push({ label:"申请权限", code:1 })
                }

                this.setData({ beans, loading: false, role, actions })
                saveRole(role)
            },
            ()=> {
                this.setData({ loading: false, fail:true })
                return true
            }
        )
    },
    toDetail (e){
        let { id } = e.currentTarget.dataset
        wx.navigateTo({ url:`/pages/view/detail?id=${id}`})
    },
    toMenu (){
        let { actions } = this.data
        let description = actions.length?"请选择菜单":"如需创建接龙，可在小程序处点击⌈客服⌋申请授权🤝"
        ActionSheet.show({
            theme: "list",
            selector: '#menus',
            context: this,
            description,
            items: actions
        })
    },
    onClose() {
        this.setData({ show: false })
    },
    onSelect(e) {
        let { selected } = e.detail
        if(selected.url){
            wx.navigateTo({ url: selected.url, fail:console.error })
        }
        else if(selected.code == 1){
            showConfirm(`申请权限`, `申请创建接龙的权限（需管理员点击通过），确定吗？`, ()=>{
                RESULT("/apply-auth", {}, ()=> ok(`申请已发起`))
            })
        }
    }
})
