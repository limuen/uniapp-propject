<template>
    <view class="shopping-cart-container">
        <view class="shopping-cart-manage">
            <view>共{{ totalQuantity }}样产品</view>
            <view v-if="status === 'pay'" @tap="manageHandle">管理</view>
            <view v-else @tap="completeHandle">完成</view>
        </view>
        <view class="commodity-list-container" v-for="(val, index) in carts" :key="index">
            <view
                class="commodity-item-container"
                v-for="(item, idx) in val.shoppingCartList"
                :key="item.commodityInventoryId"
            >
                <view class="radio-container" @tap="selectHandle(index, idx, item.selected)">
                    <image src="/static/selected-2.png" v-if="item.selected" mode=""></image>
                    <image src="/static/unselected-2.png" mode="" v-else></image>
                </view>
                <view class="commodity-img-container"><image :src="item.colourCode" mode=""></image></view>
                <view class="commodity-description-container">
                    <view class="commodity-name" @tap="toCommodityDetail(item)">{{ item.commodityName }}</view>
                    <view class="commodity-numbering" @tap="toCommodityDetail(item)">
                        编码:{{ item.commodityIdentifier }}
                    </view>
                    <view class="commodity-specification" @tap="toCommodityDetail(item)">
                        <text>颜色：{{ item.colourName }}</text>
                        <text>尺码：{{ item.size }}</text>
                        <text v-if="item.warehouseName">仓库：{{ item.warehouseName }}</text>
                    </view>
                    <view class="commodity-money-container">
                        <view v-if="item.price">¥{{ item.price }}</view>
                        <view>
                            <numberbox
                                :min="1"
                                :max="item.quantity"
                                :value="item.selectQuantity"
                                :disabled="item.selectQuantity > item.quantity || item.quantity === 0"
                                @change="quantityChange($event, index, idx, item)"
                            ></numberbox>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <view class="action-container">
            <view class="select-all-container" @tap="allSelected">
                <image src="/static/selected-2.png" mode="" v-if="totalSelected"></image>
                <image src="/static/unselected-2.png" mode="" v-else></image>
                <text>全选</text>
            </view>
            <view class="total-money-container">
                <view v-if="status === 'pay'">
                    小计：
                    <text>¥{{ totalMoney }}</text>
                </view>
            </view>
            <view class="confirm-pay-btn" @tap="actionHandle">{{ handleText }}</view>
        </view>
    </view>
</template>

<script>
import numberbox from '@/components/number-box/number-box.vue';
import { getShopping, addShopping, deleteShopping, updateShopping } from '@/api/shoppingCart.js';
export default {
    data() {
        return {
            carts: [],
            totalSelected: false,
            status: 'pay', //delete
            totalMoney: 0,
            totalQuantity: 0,
            handleText: '付款'
        };
    },
    components: {
        numberbox
    },
    methods: {
        async getCarts() {
            uni.showLoading({
                title: '加载中'
            });
            let res = (await getShopping().catch(() => {})) || [];
            uni.hideLoading();
            if (!res) return;
            this.totalQuantity = 0;
            res.forEach(item => {
                this.totalQuantity += item.shoppingCartList.length;
                item.shoppingCartList.forEach(val => {
                    val.selected = false;
                });
            });
            uni.setStorageSync('cartsNum', this.totalQuantity);
            this.totalMoney = 0;
            this.totalSelected = false;
            this.carts = res;
        },
        quantityChange(val, index, idx, item) {
            this.$set(this.carts[index].shoppingCartList[idx], 'selectQuantity', val);
        },
        selectHandle(index, idx, selected) {
            this.$set(this.carts[index].shoppingCartList[idx], 'selected', !selected);
            this.totalSelected = this.carts.every(item => {
                return item.shoppingCartList.every(val => {
                    return val.selected;
                });
            });
            this.totalMoney = this.carts.reduce((initVal, item) => {
                return (
                    initVal +
                    item.shoppingCartList.reduce((init, val) => {
                        let price = val.selected ? (val.price * 1000 * val.selectQuantity) / 1000 : 0;
                        return (init * 1000 + price * 1000) / 1000;
                    }, 0)
                );
            }, 0);
        },
        allSelected() {
            this.totalMoney = 0;
            let list = this.carts.map(item => {
                item.shoppingCartList.map(val => {
                    val.selected = !this.totalSelected;
                    if (val.selected)
                        this.totalMoney = (this.totalMoney * 1000 + val.price * 1000 * val.selectQuantity) / 1000;
                    return val;
                });
                return item;
            });

            this.carts = list;
            this.totalSelected = !this.totalSelected;
        },
        manageHandle() {
            this.status = 'delete';
            this.handleText = '删除';
        },
        completeHandle() {
            this.status = 'pay';
            this.handleText = '付款';
        },
        // 购物车操作    删除   付款
        async actionHandle() {
            let list = [];
            this.carts.forEach(item => {
                item.shoppingCartList.forEach(val => {
                    if (val.selected) {
                        list.push({
                            commodityId: val.commodityId,
                            commodityInventoryId: val.commodityInventoryId,
                            selectQuantity: val.selectQuantity,
                            amount: val.price
                        });
                    }
                });
            });
            if (list.length === 0) {
                uni.showToast({
                    title: '请先选择商品',
                    icon: 'none'
                });
                return;
            }
            if (this.status === 'pay') {
                uni.navigateTo({
                    url: '../confirmOrder/confirmOrder?list=' + JSON.stringify(list)
                });
            } else {
                await deleteShopping(list).catch(() => {});
                this.carts = [];
                this.totalMoney = 0;
                this.totalQuantity = 0;
                this.totalSelected = false;
                await this.getCarts().catch(() => {});
            }
        },
        toCommodityDetail(item) {
            uni.navigateTo({
                url: '../commodityDetail/commodityDetail?commodityId=' + item.commodityId
            });
        },
        // 更新购物车
        updateCarts() {
            if (!this.carts.length) return;
            let list = [];
            this.carts.forEach(item => {
                item.shoppingCartList.forEach(val => {
                    list.push({
                        commodityId: val.commodityId,
                        commodityInventoryId: val.commodityInventoryId,
                        selectQuantity: val.selectQuantity,
                        amount: val.price
                    });
                });
            });
            if (!list.length) return;
            updateShopping(list);
        }
    },
    onShow() {
        this.getCarts();
    },
    onUnload() {
        this.updateCarts();
    },
    onHide() {
        this.updateCarts();
    }
};
</script>

<style lang="scss">
page {
    background-color: #eee;
    color: #333;
    padding-bottom: 120upx;
}
.shopping-cart-manage {
    display: flex;
    align-items: center;
    height: 100upx;
    font-size: 28upx;
    background-color: #fff;
    margin-bottom: 12upx;
    padding: 0 24upx;
    view:first-child {
        font-size: 24upx;
        flex: 1;
    }
}

.commodity-list-container {
    margin-bottom: 20upx;
    background-color: #fff;
    padding: 0 80upx 0 32upx;
}
.commodity-item-container {
    display: flex;
    align-items: center;
    height: 248upx;
    border-bottom: 1px solid #eee;
}
.radio-container {
    margin-right: 12upx;
    image {
        width: 40upx;
        height: 40upx;
    }
}
.commodity-img-container {
    width: 144upx;
    height: 144upx;
    border: 1px solid #eee;
    image {
        max-width: 100%;
        max-height: 100%;
    }
}
.commodity-description-container {
    padding-left: 20upx;
    flex: 1;
}
.commodity-name {
    font-size: 24upx;
    padding-bottom: 10upx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.commodity-numbering,
.commodity-specification {
    font-size: 20upx;
    color: #9b9b9b;
    line-height: 36upx;
    text {
        padding-right: 20upx;
    }
}
.commodity-money-container {
    display: flex;
    padding-top: 10upx;
    & > view:first-child {
        font-size: 28upx;
        color: #ff4005;
        flex: 1;
    }
    & > view:last-child {
        font-size: 24upx;
        color: #000;
    }
}

.action-container {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    align-items: center;
    width: 100vw;
    height: 104upx;
    background-color: #fff;
    font-size: 28upx;
    box-shadow: 0 -4upx 20upx 0 rgba(0, 0, 0, 0.1);
}
.select-all-container {
    display: flex;
    align-items: center;
    padding-left: 28upx;
    image {
        width: 40upx;
        height: 40upx;
        padding-right: 12upx;
    }
}
.total-money-container {
    flex: 1;
    text-align: center;
    view:last-child {
        font-size: 24upx;
        text {
            color: #ff4005;
        }
    }
}
.confirm-pay-btn {
    width: 248upx;
    height: 104upx;
    text-align: center;
    line-height: 104upx;
    background-color: #ff4005;
    color: #fff;
}
</style>
