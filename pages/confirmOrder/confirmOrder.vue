<template>
    <view class="confirm-order-container">
        <view class="address-container">
            <image src="/static/zuobiao.png" mode=""></image>
            <view class="address-text-container" v-if="addressDetail.name">
                <view>
                    <text class="receiver">收货人：{{ addressDetail.name }}</text>
                    <text>{{ addressDetail.phone }}</text>
                </view>
                <view>
                    {{
                        addressDetail.province == addressDetail.city
                            ? addressDetail.city + addressDetail.area + addressDetail.address
                            : addressDetail.province + addressDetail.city + addressDetail.area + addressDetail.address
                    }}
                </view>
            </view>
            <view class="address-text-container" v-else>请选择地址</view>
            <view class="edit-container" @tap="toAddress">
                <text>更改地址</text>
                <image src="/static/right-arrow.png" mode=""></image>
            </view>
        </view>

        <view class="commodity-list-container" v-for="(item, index) in detail.warehouseOrderList" :key="item.id">
            <view class="commodity-item-container" :class="val.disabled ? 'commodity-disabled' : ''" v-for="(val, commodityIndex) in item.orderCommoditysList"
                :key="val.id">
                <view class="radio-container" @tap="commoditySelectHandle(index, commodityIndex)">
                    <image src="/static/selected-2.png" v-if="val.selected" mode=""></image>
                    <image src="/static/unselected-2.png" v-else mode=""></image>
                </view>
                <view class="commodity-img-container">
                    <image :src="val.commodityImageUrl" mode=""></image>
                </view>
                <view class="commodity-description-container">
                    <view class="commodity-name">{{ val.commodityTitle }}</view>
                    <view class="commodity-numbering">编码:{{ val.commodityIdentifier }}</view>
                    <view class="commodity-specification">
                        <text>颜色：{{ val.commodityColour }}</text>
                        <text>尺码：{{ val.commoditySize }}</text>
                        <text>仓库：{{ item.warehouseName }}</text>
                    </view>
                    <view class="commodity-money-container">
                        <view>¥{{ val.commodityPrice }}</view>
                        <view>X{{ val.quantity }}</view>
                    </view>
                </view>
            </view>
            <view class="delivery-container">
                <view>
                    <view class="delivery-method">
                        <text>配送方式</text>
                        <view class="delivery-picker-container">
                            <picker @change="deliveryPickerChange($event, index)" :value="item.deliveryIndex" :range="deliveryArr.filter((warehouse,warehouseIndex)=>{return warehouse.warehouseId == item.warehouseId || warehouseIndex == 0})"
                                range-key="name">
                                <view class="uni-input">{{ deliveryArr.filter((warehouse,warehouseIndex)=>{return warehouse.warehouseId == item.warehouseId || warehouseIndex == 0})[item.deliveryIndex].name }}</view>
                            </picker>
                            <image src="/static/icon-down-arrow.png" mode=""></image>
                        </view>
                    </view>
                    <view class="delivery-cost">
                        <text>配送费</text>
                        <text>￥{{ item.warehouseOrderCost.freight }}</text>
                    </view>
                </view>
                <view class="child-order-total-container">
                    <view>共{{ item.commodityQuantity }}件商品</view>
                    <view>
                        合计:
                        <text>¥{{ item.warehouseOrderCost.orderTotal }}</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="invoice-container">
            <view>发票</view>
            <view class="invoice-picker-container">
                <picker @change="invoicePickerChange" :value="index" :range="array">
                    <view class="uni-input">{{ array[index] }}</view>
                </picker>
                <image src="/static/icon-down-arrow.png" mode=""></image>
            </view>
        </view>
        <view class="remark-container">
            <view>备注</view>
            <textarea maxlength="-1" auto-height="true" value="" @input="remarkChange" placeholder="选填，请和商家协商一致之后填写" />
            </view>

        <cover-view class="action-container">
            <cover-view class="select-all-container" @tap="selectedHandle">
                <cover-image src="/static/selected-2.png" v-if="totalSelected" mode=""></cover-image>
                <cover-image src="/static/unselected-2.png" v-else mode=""></cover-image>
                <cover-view>全选</cover-view>
            </cover-view>
            <cover-view class="total-money-container">
                <cover-view class="money-item-container">
                    <cover-view>合计(含运费)：</cover-view>
                    <cover-view>¥{{ detail.amount || 0 }}</cover-view>
                </cover-view>
                <cover-view class="bottom-commodity-money-container">
                    <cover-view>商品金额：</cover-view>
                    <cover-view>¥{{ detail.orderCost.commodityTotal || 0 }}</cover-view>
                </cover-view>
            </cover-view>
            <cover-view class="confirm-pay-btn" @tap="addOrder">确认支付</cover-view>
        </cover-view>
    </view>
</template>

<script>
import { getPreparatoryOrder, addOrder, payOrder, getDeliveryList, getDeliveryFreight } from '@/api/order.js';
import { getAddressList } from '@/api/address.js';
import global from '@/utils/global.js';
export default {
    data() {
        return {
            array: ['不开发票', '开发票'],
            deliveryArr: [{name:'请选择配送方式'}],
            index: 0,
            totalSelected: true,
            detail: {},
            addressDetail: {},
            params: {
                immediatePurchase: false
            },
            isAdded: false
        };
    },
    methods: {
        deliveryPickerChange(e, index) {
            if(!+e.detail.value)return
            let deliveryIndex = e.detail.value,
            warehouseItem = this.detail.warehouseOrderList[index],
            deliveryArr = this.deliveryArr.filter((warehouse,warehouseIndex)=>{return warehouse.warehouseId == warehouseItem.warehouseId || warehouseIndex == 0}),
            delivery = deliveryArr[e.detail.value];
            
            this.$set(warehouseItem, 'deliveryIndex', deliveryIndex);
            this.$set(warehouseItem, 'deliveryWay', delivery.name);
            if (this.addressDetail.province) {
                let obj = {
                    expressCommpany: delivery.name,
                    province: this.addressDetail.province,
                    warehouseId: warehouseItem.warehouseId,
                    wmsOrgId: warehouseItem.wmsOrgId
                };
                getDeliveryFreight({ wmsExpressList: [obj] })
                    .then(res => {
                        if (res) {
                            let deliveryObj = res.expressFreightBOList[0];
                            this.$set(
                                warehouseItem,
                                'firstWeight',
                                deliveryObj.firstWeight * 1000 || 0
                            );
                            this.$set(
                                warehouseItem,
                                'firstCharge',
                                deliveryObj.firstCharge || 0
                            );
                            this.$set(
                                warehouseItem,
                                'additionalWeight',
                                deliveryObj.additionalWeight * 1000 || 0
                            );
                            this.$set(
                                warehouseItem,
                                'additionalCharge',
                                deliveryObj.additionalCharge || 0
                            );
                            this.calculatePrice();
                        }
                    })
                    .catch(() => {
                        this.$set(warehouseItem, 'firstWeight', 0);
                        this.$set(warehouseItem, 'firstCharge', 0);
                        this.$set(warehouseItem, 'additionalWeight', 0);
                        this.$set(warehouseItem, 'additionalCharge', 0);
                        this.calculatePrice();
                    });
            } else {
                uni.showToast({
                    title: '请先选择收货地址',
                    icon: 'none'
                });
            }
        },
        invoicePickerChange(e) {
            let index = e.detail.value;
            this.index = index;
            this.detail.receipt = index;
            this.calculatePrice();
        },
        // 获取预订单信息
        async getOrderInfo(params) {
            uni.showLoading({
                title: '加载中'
            });
            let detail = await getPreparatoryOrder(params).catch(() => {
                    uni.showModal({
                        title: '提示',
                        content: '获取订单数据失败',
                        showCancel: false,
                        success: res => {
                            if (res.confirm) {
                                uni.navigateBack({});
                            }
                        }
                    });
                }),
                list = [];
            uni.hideLoading();
            if (!detail) return;
            detail.orderInfoList[0].receipt = 0;
            detail.orderInfoList[0].source = '微信小程序';
            detail.orderInfoList[0].warehouseOrderList.forEach(item => {
                item.deliveryIndex = 0;
                item.commodityQuantity = 0;
                item.firstWeight = 0;
                item.firstCharge = 0;
                item.additionalWeight = 0;
                item.additionalCharge = 0;
                item.orderCommoditysList.forEach(val => {
                    val.selected = true;
                    item.commodityQuantity += val.quantity;
                });
            });
            this.detail = detail.orderInfoList[0];
            this.calculateFreight();
        },
        // 下单
        addOrder() {
            if (this.isAdded) return;
            if (!this.addressDetail.phone) {
                uni.showToast({
                    title: '请先选择地址',
                    icon: 'none'
                });
                return;
            }
            if (
            !this.detail.warehouseOrderList.every(warehouse =>
                      warehouse.orderCommoditysList.some(commodity => commodity.selected)
                        ? !!warehouse.deliveryWay
                        : true
                    )
            ) {
                uni.showToast({
                    title: '请选择配送方式',
                    icon: 'none'
                });
                return;
              }
            let params = {
                orderInfo: JSON.parse(JSON.stringify(this.detail)),
                immediatePurchase: this.params.immediatePurchase
            };
            params.orderInfo.province = this.addressDetail.province;
            params.orderInfo.city = this.addressDetail.city;
            params.orderInfo.area = this.addressDetail.area;
            params.orderInfo.deliveryAddress = this.addressDetail.address;
            params.orderInfo.deliveryPhone = this.addressDetail.phone;
            params.orderInfo.deliveryName = this.addressDetail.name;
            params.orderInfo.orderCost.coupon = 0;
            params.orderInfo.orderCost.kuCredit = 0;
            params.orderInfo.orderCost.rebate = 0;
            params.orderInfo.warehouseOrderList = params.orderInfo.warehouseOrderList.filter(item => {
                item.orderCommoditysList = item.orderCommoditysList.filter(val => {
                    return val.selected;
                });

                item.province = this.addressDetail.province;
                item.city = this.addressDetail.city;
                item.area = this.addressDetail.area;
                item.deliveryAddress = this.addressDetail.address;
                item.deliveryPhone = this.addressDetail.phone;
                item.deliveryName = this.addressDetail.name;
                // item.deliveryWay = this.deliveryArr[item.deliveryIndex].name;
                item.warehouseOrderCost.coupon = 0;
                item.warehouseOrderCost.kuCredit = 0;
                item.warehouseOrderCost.rebate = 0;
                return item.orderCommoditysList.length > 0;
            });
            if (!params.orderInfo.warehouseOrderList.length) {
                uni.showToast({
                    title: '请选择商品',
                    icon: 'none'
                });
                return;
            }

            this.isAdded = true;
            uni.showLoading({
                title: '加载中'
            });
            addOrder(params)
                .then(res => {
                    payOrder(res.orderId)
                        .then(response => {
                            uni.hideLoading();
                            uni.requestPayment({
                                provider: 'wxpay',
                                timeStamp: response.wxPayAppOrderResult.timeStamp,
                                nonceStr: response.wxPayAppOrderResult.nonceStr,
                                package: response.wxPayAppOrderResult.packageValue,
                                signType: response.wxPayAppOrderResult.signType,
                                paySign: response.wxPayAppOrderResult.paySign,
                                success: () => {},
                                complete: () => {
                                    wx.redirectTo({
                                        url: `../orderDetail/orderDetail?orderId=${res.orderId}&from=confirmOrder`
                                    });
                                    
                                }
                            });
                        })
                        .catch(() => {
                            uni.hideLoading();
                            wx.redirectTo({
                                url: '../orderDetail/orderDetail?orderId=' + res.orderId
                            });
                        });
                })
                .catch(error => {
                    uni.hideLoading();
                    this.isAdded = false;
                    if (error.data.status == 400 && error.data.data.offShelfCommodityIdList) {
                        this.detail.warehouseOrderList.forEach(item => {
                            item.orderCommoditysList.forEach(val => {
                                error.data.data.offShelfCommodityIdList.forEach(current => {
                                    if (val.commodityId == current) {
                                        val.selected = false;
                                        val.disabled = true;
                                    }
                                });
                            });
                        });
                    }
                    this.calculateFreight();
                });
        },
        async getAddressList() {
            let addressList = (await getAddressList().catch(() => {})) || [];
            if (!addressList.length) return;
            this.addressDetail =
                addressList.filter(item => {
                    return item.defaultEnable === 1;
                })[0] || {};
        },
        selectedHandle() {
            this.totalSelected = !this.totalSelected;
            this.detail.warehouseOrderList.forEach(item => {
                item.orderCommoditysList.forEach(val => {
                    if (!val.disabled) {
                        val.selected = this.totalSelected;
                    }
                });
            });
            this.calculatePrice();
        },
        commoditySelectHandle(index, commodityIndex) {
            if (this.detail.warehouseOrderList[index].orderCommoditysList[commodityIndex].disabled) return;
            let bool = this.detail.warehouseOrderList[index].orderCommoditysList[commodityIndex].selected;
            this.$set(this.detail.warehouseOrderList[index].orderCommoditysList[commodityIndex], 'selected', !bool);
            this.totalSelected = this.detail.warehouseOrderList.every(item => {
                return item.orderCommoditysList.every(val => {
                    return val.selected;
                });
            });
            this.calculatePrice();
        },
        toAddress() {
            uni.navigateTo({
                url: '../addressList/addressList'
            });
        },
        // 计算选中商品及预订单金额
        calculatePrice() {
            let orderList = JSON.parse(JSON.stringify(this.detail));
            let orderTotal = 0,
                freight = 0,
                paid = 0,
                commodityTotal = 0,
                payable = 0,
                taxRateObj = {};
            this.detail.warehouseOrderList.forEach(item => {
                item.warehouseOrderCost.commodityTotal = 0;
                item.warehouseOrderCost.orderTotal = 0;
                item.warehouseOrderCost.paid = 0;
                item.warehouseOrderCost.payable = 0;
                item.warehouseOrderCost.amount = 0;
                item.warehouseOrderCost.freight = 0;
                item.commodityWeight = 0;
                item.freight = 0;
                item.orderCommoditysList.forEach(val => {
                    if (val.selected) {
                        //*1000防止精度丢失
                        item.warehouseOrderCost.commodityTotal =
                            Math.round(
                                item.warehouseOrderCost.commodityTotal * 1000 + val.commodityPrice * 1000 * val.quantity
                            ) / 1000;
                        item.commodityWeight += val.commodityWeight * val.quantity;
                        if (!taxRateObj[val.commodityId]) {
                          taxRateObj[val.commodityId] = {
                            taxRate: val.taxRate,
                            commodityTotal: Math.round(val.commodityPrice * 1000 * val.quantity) / 1000
                          };
                        } else    {
                          taxRateObj[val.commodityId].commodityTotal =
                            Math.round(
                              taxRateObj[val.commodityId].commodityTotal * 1000 +
                                val.commodityPrice * 1000 * val.quantity
                            ) / 1000;
                        }
                    }
                });

                item.warehouseOrderCost.freight =
                    item.commodityWeight <= item.firstWeight
                        ? item.commodityWeight == 0
                            ? 0
                            : item.firstCharge
                        : item.firstWeight == 0
                        ? 0
                        : item.firstCharge +
                              Math.ceil((item.commodityWeight - item.firstWeight) / item.additionalWeight) *
                                  item.additionalCharge || 0;
                item.freight = item.warehouseOrderCost.freight;
                item.warehouseOrderCost.orderTotal =
                    item.warehouseOrderCost.commodityTotal + item.warehouseOrderCost.freight;
                item.warehouseOrderCost.paid = item.warehouseOrderCost.orderTotal;
                item.warehouseOrderCost.payable = item.warehouseOrderCost.orderTotal;
                item.warehouseOrderCost.amount = item.warehouseOrderCost.orderTotal;
                item.amount = item.warehouseOrderCost.amount;

                orderTotal = Math.round(orderTotal * 1000 + item.warehouseOrderCost.orderTotal * 1000) / 1000;
                commodityTotal =
                    Math.round(commodityTotal * 1000 + item.warehouseOrderCost.commodityTotal * 1000) / 1000;
                freight += item.warehouseOrderCost.freight;
                // paid += item.warehouseOrderCost.paid;
                // payable += item.warehouseOrderCost.payable;
            });
            let tax = this.index == 1 
                ? Object.values(taxRateObj).reduce((total, item) => {
                      return Math.round(total * 100 + item.commodityTotal * 100 * item.taxRate) / 100;
                    }, 0)
                : 0;
            orderTotal = Math.round(orderTotal * 100 + tax * 100) / 100;
            this.$set(this.detail.orderCost, 'orderTotal', orderTotal);
            this.$set(this.detail.orderCost, 'freight', freight);
            this.$set(this.detail.orderCost, 'paid', orderTotal);
            this.$set(this.detail.orderCost, 'payable', orderTotal);
            this.$set(this.detail.orderCost, 'commodityTotal', commodityTotal);
            this.$set(this.detail.orderCost, 'tax', tax);
            this.$set(this.detail, 'amount', orderTotal);
            // orderTotal 订单总额  paid 实付 payable 应付  amount 订单总额  相同
            // commodityTotal  商品总额   freight  运费
        },
        async getDelivery() {
            let deliveryArr = await getDeliveryList();
            if (deliveryArr) {
                this.deliveryArr = [{name:'请选择配送方式'},...deliveryArr.expressCompanyList];
            }
        },
        async calculateFreight() {
            if (!this.addressDetail.province) return;
            if (!this.detail.warehouseOrderList.every(warehouse => !!warehouse.deliveryIndex)) {
                return;
              }
            let list = [];
            this.detail.warehouseOrderList.forEach(item => {
                let obj = {
                    expressCommpany: item.deliveryWay,
                    province: this.addressDetail.province,
                    warehouseId: item.warehouseId,
                    wmsOrgId: item.wmsOrgId
                };
                list.push(obj);
            });
            if (list.length) {
                let deliveryObj = (await getDeliveryFreight({ wmsExpressList: list }).catch(() => {})) || {};
                let deliveryList = deliveryObj.expressFreightBOList;

                this.detail.warehouseOrderList.forEach(item => {
                    if (deliveryList) {
                        deliveryList.forEach(val => {
                            if (val.warehouseId == item.warehouseId) {
                                item.firstWeight = val.firstWeight * 1000 || 0;
                                item.firstCharge = val.firstCharge || 0;
                                item.additionalWeight = val.additionalWeight * 1000 || 0;
                                item.additionalCharge = val.additionalCharge || 0;
                            }
                        });
                    } else {
                        item.firstWeight = 0;
                        item.firstCharge = 0;
                        item.additionalWeight = 0;
                        item.additionalCharge = 0;
                    }
                });
            }
            this.calculatePrice();
        },
        remarkChange(e) {
            this.detail.orderRemark = e.detail.value;
        }
    },
    async onLoad(options) {
        let list = JSON.parse(options.list);
        await this.getDelivery();
        await this.getAddressList();
        this.getOrderInfo(list);
        this.params.immediatePurchase = options.immediatePurchase == 'true' ? true : false;
    },
    onShow() {
        if (global.addressDetail.id && JSON.stringify(global.addressDetail) != JSON.stringify(this.addressDetail)) {
            this.addressDetail = global.addressDetail;
            this.calculateFreight();
        }
    },
    onUnload() {
        global.addressDetail = {};
    }
};
</script>

<style lang="scss">
page {
    background-color: #eee;
    color: #333;
    padding-bottom: 200upx;
}

.address-container {
    padding: 0 32upx;
    display: flex;
    align-items: center;
    height: 160upx;
    margin-bottom: 20upx;
    font-size: 24upx;
    background-color: #fff;
    image {
        width: 40upx;
        height: 40upx;
    }
}
.receiver {
    padding-right: 28upx;
}
.address-text-container {
    padding-left: 20upx;
    flex: 1;
    view:last-child {
        padding: 8upx 20upx 0 0;
    }
}
.edit-container {
    display: flex;
    align-items: center;
    text {
        color: #9b9b9b;
        line-height: 1;
        padding-right: 28upx;
    }
    image {
        width: 20upx;
        height: 28upx;
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
.commodity-disabled {
    view {
        color: #9b9b9b !important;
    }
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
    view:first-child {
        font-size: 28upx;
        color: #ff4005;
        flex: 1;
    }
    view:last-child {
        font-size: 24upx;
        color: #000;
    }
}
.delivery-container {
    padding: 0 20upx 52upx 40upx;
    font-size: 24upx;
    & > view {
        display: flex;
        align-items: center;
    }
}
.delivery-method {
    flex: 1;
    display: flex;
    align-items: center;

    text {
        font-size: 28upx;
    }
}
.delivery-picker-container {
    display: flex;
    align-items: center;
    view {
        padding: 0 20upx 0 28upx;
    }
    image {
        width: 28upx;
        height: 20upx;
    }
}
.delivery-cost {
    text:last-child {
        padding-left: 20upx;
        color: #ff4005;
    }
}
.child-order-total-container {
    justify-content: flex-end;
    padding-top: 12upx;
    view:last-child {
        padding-left: 60upx;
        text {
            font-size: 28upx;
        }
    }
}

.action-container {
    position: fixed;
    left: 0;
    bottom: 0;
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
    cover-image {
        width: 40upx;
        height: 40upx;
        padding-right: 12upx;
    }
}
.total-money-container {
    flex: 1;
    text-align: center;
    .money-item-container,
    .bottom-commodity-money-container {
        display: flex;
        align-items: center;
        padding-left: 40upx;
        cover-view:last-child {
            flex: 1;
            text-align: left;
        }
    }
    .bottom-commodity-money-container {
        font-size: 24upx;
        padding-top: 10upx;
        cover-view:last-child {
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

.invoice-container {
    display: flex;
    align-items: center;
    height: 120upx;
    font-size: 28upx;
    padding-left: 72upx;
    background-color: #fff;
}
.invoice-picker-container {
    display: flex;
    align-items: center;
    image {
        width: 24upx;
        height: 16upx;
    }
    view {
        font-size: 24upx;
        padding: 0 12upx 0 136upx;
    }
}

.remark-container {
    display: flex;
    padding-left: 72upx;
    padding-bottom: 40upx;
    color: #333;
    background-color: #fff;
    view {
        font-size: 28upx;
        line-height: 1;
        margin-right: 40upx;
    }
    textarea {
        font-size: 24upx;
        flex: 1;
        margin-right: 80upx;
        text-indent: 2em;
    }
}
.uni-input {
    height: 40px;
    line-height: 40px;
}
</style>
