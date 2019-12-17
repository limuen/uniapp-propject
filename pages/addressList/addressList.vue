<template>
    <view class="address-list-container">
        <view class="address-item-container" v-for="(item, index) in addressList" :key="item.id">
            <view class="address-item-text-container">
                <view class="select-address-container" v-if="isSelect" @tap="selectAddressHandle(item)">
                    <image src="/static/selected-2.png" v-if="item.selected" mode=""></image>
                    <image src="/static/unselected-2.png" mode="" v-else></image>
                </view>
                <view class="address-item-text" @tap="selectAddressHandle(item)">
                    <view>
                        收货人：{{ item.name }}
                        <text>{{ item.phone }}</text>
                    </view>
                    <view>
                        {{
                            item.province == item.city
                                ? item.city + item.area + item.address
                                : item.city == item.area
                                ? item.province + item.city + item.address
                                : item.province + item.city + item.area + item.address
                        }}
                    </view>
                </view>
                <image src="/static/xiugai.png" mode="" @tap="editHandle(index, item.isEdit)"></image>
            </view>

            <view class="edit-container" v-if="item.isEdit">
                <view class="set-default" @tap="setDefault(item, index)">
                    <image src="/static/unselected-2.png" v-if="item.defaultEnable === 0" mode=""></image>
                    <image src="/static/selected-2.png" mode="" v-else></image>
                    <text>设置默认</text>
                </view>
                <view class="edit">
                    <view @tap="editAddress(item)">
                        <image src="/static/bianji@2x.png" mode=""></image>
                        <text>编辑</text>
                    </view>
                </view>
                <view class="delete-container" @tap="deleteAddress(item.id, index)">
                    <image src="/static/lajitongshanchu@2x.png" mode=""></image>
                    <text>删除</text>
                </view>
            </view>
        </view>

        <view class="btn-container"><view class="btn" @tap="addAddress">新增收货地址</view></view>
    </view>
</template>

<script>
import { getAddressList, deleteAddress, updateAddress } from '@/api/address.js';
import global from '@/utils/global.js';
export default {
    data() {
        return {
            isSelect: false,
            addressList: []
        };
    },
    methods: {
        editHandle(index, isEdit) {
            this.$set(this.addressList[index], 'isEdit', !isEdit);
        },
        async getAddressList() {
            uni.showLoading({
                title: '加载中'
            });
            let list = await getAddressList().catch(() => {});
            uni.hideLoading();
            if (!list) return;
            list.forEach(item => {
                item.isEdit = false;
                if (this.isSelect) {
                    let pages = getCurrentPages(),
                        prevPage = pages[pages.length - 2];
                    item.selected = item.id === prevPage.data.addressDetail.id ? true : false;
                }
            });
            this.addressList = list;
        },
        async setDefault(val, index) {
            val.defaultEnable = val.defaultEnable === 0 ? 1 : 0;
            await updateAddress(val).catch(() => {});
            await this.getAddressList().catch(() => {});
        },
        async deleteAddress(id, index) {
            await deleteAddress(id).catch(() => {});
            this.addressList.splice(index, 1);
        },
        editAddress(val) {
            uni.navigateTo({
                url: '../addAddress/addAddress?detail=' + JSON.stringify(val)
            });
        },
        addAddress() {
            uni.navigateTo({
                url: '../addAddress/addAddress'
            });
        },
        selectAddressHandle(val) {
            if (!this.isSelect) return;
            global.addressDetail = val;
            uni.navigateBack({});
        }
    },
    onShow() {
        let pages = getCurrentPages();
        if (pages[pages.length - 2].route.indexOf('confirmOrder') > 0) this.isSelect = true;
        this.getAddressList();
    }
};
</script>

<style lang="scss">
page {
    background-color: #eee;
    padding-top: 20upx;
    padding-bottom: 200upx;
}
.address-item-container {
    font-size: 24upx;
    color: #333;
    margin-bottom: 12upx;
    background-color: #fff;
}
.address-item-text-container {
    display: flex;
    align-items: center;
    line-height: 44upx;
    height: 176upx;
    padding: 0 52upx 0 32upx;
    .select-address-container {
        padding: 20upx 32upx 20upx 0;
        image {
            width: 40upx;
            height: 40upx;
        }
    }
    .address-item-text {
        flex: 1;
    }
    text {
        padding-left: 20upx;
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
