<template>
    <view class="invoice-container">
        <view class="invoice-item-container" v-for="(item, index) in invoiceList" :key="item.id">
            <view class="invoice-item-text-container">
                <text>发票抬头</text>
                <text>{{ item.title }}</text>
                <image src="/static/xiugai.png" mode="" @tap="editHandle(index, item.isEdit)"></image>
            </view>

            <view class="edit-container" v-if="item.isEdit">
                <view class="set-default" @tap="setDefault(item, index)">
                    <image src="/static/unselected-2.png" v-if="item.defaultEnable === 0" mode=""></image>
                    <image src="/static/selected-2.png" v-else mode=""></image>
                    <text>设置默认</text>
                </view>
                <view class="edit">
                    <view @tap="editInvoice(item)">
                        <image src="/static/bianji@2x.png" mode=""></image>
                        <text>编辑</text>
                    </view>
                </view>
                <view class="delete-container" @tap="deleteInvoice(item.id,index)">
                    <image src="/static/lajitongshanchu@2x.png" mode=""></image>
                    <text>删除</text>
                </view>
            </view>
        </view>

        <view class="btn-container" @tap="addInvoice"><view class="btn">新增发票抬头</view></view>
    </view>
</template>

<script>
import { getInvoiceList, deleteInvoice, updateInvoice } from '@/api/invoice.js';
export default {
    data() {
        return {
            invoiceList: []
        };
    },
    methods: {
        async getInvoiceList() {
            uni.showLoading({
                title:'加载中'
            })
            let list = (await getInvoiceList().catch(() => {})) || [];
            list.forEach(item => {
                item.isEdit = false;
            });
            this.invoiceList = list;
            uni.hideLoading()
        },
        editHandle(index, isEdit) {
            this.$set(this.invoiceList[index], 'isEdit', !isEdit);
        },
        async setDefault(val, index) {
            val.defaultEnable = val.defaultEnable === 0 ? 1 : 0;
            await updateInvoice(val).catch(() => {});
            await this.getInvoiceList().catch(() => {});
        },
        async deleteInvoice(id,index) {
            await deleteInvoice(id).catch(() => {});
            this.invoiceList.splice(index,1)
        },
        editInvoice(val) {
            uni.navigateTo({
                url: '../addInvoice/addInvoice?detail=' + JSON.stringify(val)
            });
        },
        addInvoice() {
            uni.navigateTo({
                url: '../addInvoice/addInvoice'
            });
        }
    },
    onShow() {
        this.getInvoiceList();
    }
};
</script>

<style lang="scss">
page {
    background-color: #eee;
    padding-top: 20upx;
    padding-bottom: 200upx;
}
.invoice-item-container {
    font-size: 24upx;
    color: #333;
    margin-bottom: 12upx;
    background-color: #fff;
}
.invoice-item-text-container {
    display: flex;
    align-items: center;
    line-height: 44upx;
    height: 116upx;
    padding: 0 52upx 0 32upx;
    text {
        padding-left: 20upx;
    }
    text:nth-child(2) {
        flex: 1;
    }
    image {
        width: 28upx;
        height: 28upx;
    }
}
.edit-container {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-top: 1px solid #eee;
    font-size: 24upx;
    color: #9b9b9b;
    width: 680upx;
    margin: 0 auto;
    padding: 20upx 0;
}
.set-default {
    display: flex;
    align-items: center;
    image {
        width: 40upx;
        height: 40upx;
        margin-right: 20upx;
    }
}
.edit,
.delete-container {
    display: flex;
    align-items: center;
    padding-left: 32upx;
    image {
        width: 24upx;
        height: 24upx;
        margin-right: 12upx;
    }
}
.edit {
    flex: 1;
    justify-content: flex-end;
}
.edit view {
    display: flex;
    align-items: center;
}

.btn-container {
    width: 100vw;
    height: 200upx;
    background-color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    padding-top: 60upx;
    box-sizing: border-box;
}
.btn {
    width: 686upx;
    height: 100upx;
    margin: 0 auto;
    background-color: #6dabff;
    box-shadow: 0 4upx 20upx 0 rgba(0, 0, 0, 0.1);
    border-radius: 8upx;
    text-align: center;
    line-height: 100upx;
    font-size: 28upx;
    color: #fff;
}
</style>
