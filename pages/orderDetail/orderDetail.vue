<template>
    <view class="order-container" v-if="detail.identifier">
        <view class="address-container">
            <image src="/static/zuobiao.png" mode=""></image>
            <view class="receiver-container">
                <view class="receiver-text">
                    <text>收货人：</text>
                    <text>{{ detail.deliveryName }}</text>
                    <text>{{ detail.deliveryPhone }}</text>
                </view>
                <view class="address-text">
                    {{ detail.province + detail.city + detail.area + detail.deliveryAddress }}
                </view>
            </view>
        </view>

        <view class="child-order-container">
            <view v-for="(item, index) in detail.warehouseOrderList" :key="item.id" :style="{ 'margin-bottom': index === detail.warehouseOrderList.length - 1 ? 0 : '6px' }">
                <view class="child-order-number">分仓单号：{{ item.identifier }}</view>
                <view class="commodity-container" v-for="val in item.orderCommoditysList" :key="val.id">
                    <image :src="val.commodityImageUrl" mode=""></image>
                    <view class="commodity-description-container">
                        <view class="commodity-name">{{ val.commodityTitle }}</view>
                        <view class="commodity-number">编码:{{ val.commodityIdentifier }}</view>
                        <view class="commodity-specification">
                            <text>颜色：{{ val.commodityColour }}</text>
                            <text>尺码：{{ val.commoditySize }}</text>
                            <text>仓库：{{ item.warehouseName }}</text>
                        </view>
                        <view class="commodity-money-container">
                            <view class="commodity-money">￥{{ val.commodityPrice }}</view>
                            <view class="commodity-quantity">x{{ val.quantity }}</view>
                        </view>
                    </view>
                </view>

                <view class="child-order-total-container">
                    <view class="delivery-container">
                        <view class="delivery-method">
                            <text>配送方式</text>
                            <text>{{ item.deliveryWay }}</text>
                        </view>
                        <view class="delivery-cost">
                            <text>配送费</text>
                            <text>¥{{ item.warehouseOrderCost.freight }}</text>
                        </view>
                    </view>

                    <view class="child-order-total">
                        <view>共{{ item.quantity }}件商品</view>
                        <view>
                            合计:
                            <text>¥{{ item.warehouseOrderCost.orderTotal }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <view class="order-pay-money-container">
                <view class="money-container">
                    <view>
                        商品金额:
                        <text>￥{{ detail.orderCost.commodityTotal }}</text>
                    </view>
                    <view>
                        服务费:
                        <text>￥{{ detail.orderCost.serviceFee || 0 }}</text>
                    </view>
                    <view>
                        合计:
                        <text>￥{{ detail.orderCost.orderTotal }}</text>
                    </view>
                </view>
            </view>
        </view>

        <view class="order-item-detail">
            <view>
                <view>发票</view>
                <view>{{ detail.receipt | formatReceipt }}</view>
            </view>
            <view v-if="detail.orderRemark && detail.orderRemark != '-'">
                <view>备注</view>
                <view class="remark-content">{{ detail.orderRemark }}</view>
            </view>
            <view>
                <view>订单号</view>
                <view>{{ detail.identifier }}</view>
            </view>
            <view v-if="detail.status > 1">
                <view>付款时间</view>
                <view>{{ detail.payOrderTime }}</view>
            </view>
            <view v-if="detail.status >= 4">
                <view>快递查询</view>
                <view class="delivery-search">
                    <template v-for="(item,index) in trackingNumberArr">
                        <view :key="item" v-if="index == 0 || (index > 0 && deliveryShow)" @tap="handleDelivery(index,item)">{{ item }}</view>
                    </template>
                    <view v-if="trackingNumberArr.length > 1" :class="['delivery-more', deliveryShow ? 'delivery-more-show':'']"
                        @tap="handleMore">更多</view>
                </view>

            </view>
        </view>

        <view class="action-container" v-if="detail.status == 3 || detail.status >= 4 || detail.status == 1">
            <view class="delivery-btn" v-if="detail.status >= 4" @tap="handleDelivery(0)">查看物流</view>
            <view v-if="detail.status === 3" @tap="remindHandle">提醒发货</view>
            <view v-else-if="detail.status === 4" @tap="confirmReceipt">确认收货</view>
            <view v-else-if="detail.status === 1" @tap="toPay">立即付款</view>
        </view>
    </view>
</template>

<script>
    import {
        getOrder,
        updateOrderStatus,
        payOrder,
        getPay
    } from '@/api/order.js';
    export default {
        data() {
            return {
                detail: {},
                trackingNumberArr: [],
                deliveryShow: false,
                isDestroy: false
            };
        },
        methods: {
            toPay() {
                payOrder(this.detail.id)
                    .then(response => {
                        uni.requestPayment({
                            provider: 'wxpay',
                            timeStamp: response.wxPayAppOrderResult.timeStamp,
                            nonceStr: response.wxPayAppOrderResult.nonceStr,
                            package: response.wxPayAppOrderResult.packageValue,
                            signType: response.wxPayAppOrderResult.signType,
                            paySign: response.wxPayAppOrderResult.paySign,
                            success: () => {
                                uni.showLoading({
                                    title:'加载中'
                                })
                                setTimeout(() => {
                                    this.getOrderDetail(this.detail.id)
                                }, 2000)
                            },
                            complete: () => {}
                        });
                    })
                    .catch(() => {});
            },
            remindHandle() {
                uni.showToast({
                    title: '提醒发货成功',
                    icon: 'none'
                });
            },
            confirmReceipt() {
                let obj = {
                    id: this.detail.id,
                    status: 5
                };
                updateOrderStatus(obj)
                    .then(() => {
                        this.detail.status = 5;
                    })
                    .catch(() => {});
            },
            handleMore() {
                this.deliveryShow = !this.deliveryShow
            },
            handleDelivery(index, number) {
                let trackingNumber = number || this.detail.warehouseOrderList[index].trackingNumber,
                    deliveryWay = this.detail.warehouseOrderList[index].deliveryWay,
                    warehouseName = this.detail.warehouseOrderList[index].warehouseName,
                    orderCommoditysList = JSON.stringify(this.detail.warehouseOrderList[index].orderCommoditysList)

                uni.navigateTo({
                    url: `../delivery/delivery?trackingNumber=${trackingNumber}&deliveryWay=${deliveryWay}&orderCommoditysList=${orderCommoditysList}&warehouseName=${warehouseName}`
                })
            },
            getOrderDetail(orderId) {
                if (this.isDestroy) return
                getOrder({
                    orderId
                }).then(response => {
                    if (response) {
                        uni.hideLoading()
                        response.orderInfoList[0].warehouseOrderList.forEach(item => {
                            item.quantity = 0;
                            item.orderCommoditysList.forEach(val => {
                                item.quantity += val.quantity;
                            });
                        });
                        this.detail = response.orderInfoList[0];
                    }

                }).catch((error) => {
                    if (error.data.status === 400) {
                        setTimeout(() => {
                            this.getOrderDetail(orderId)
                        }, 2000)
                    }
                })
            }
        },
        filters: {
            formatReceipt(val) {
                const map = {
                    0: '不需要发票',
                    1: '已开发票'
                };
                return map[val];
            }
        },
        async onLoad(options) {
            uni.showLoading({
                title: '加载中'
            });
            if (options.from === 'confirmOrder') {
                await new Promise((resolve) => {
                    setTimeout(resolve, 2000);
                });
            }
            let order = await getOrder({
                orderId: options.orderId
            }).catch(() => {});
            if (!order) return;
            order.orderInfoList[0].warehouseOrderList.forEach(item => {
                item.quantity = 0;
                if (item.status >= 4) this.trackingNumberArr.push(item.trackingNumber)
                item.orderCommoditysList.forEach(val => {
                    item.quantity += val.quantity;
                });
            });
            this.detail = order.orderInfoList[0];
            uni.hideLoading();
        },
        onUnload() {
            this.isDestroy = true
        }
    };
</script>

<style lang="scss">
    page {
        background-color: #eee;
        padding-bottom: 140upx;
    }

    .address-container {
        height: 156upx;
        padding: 40upx;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        font-size: 24upx;
        color: #333;
        margin-bottom: 20upx;
        box-shadow: 0 0 8upx 0 rgba(0, 0, 0, 0.2);
        background-color: #fff;

        image {
            width: 40upx;
            height: 40upx;
            margin-right: 20upx;
        }
    }

    .address-text {
        padding-top: 10upx;
    }

    .receiver-text text:last-child {
        padding-left: 24upx;
    }

    .child-order-container {
        box-shadow: 0 0 8upx 0 rgba(0, 0, 0, 0.16);

        &>view {
            background-color: #fff;
        }
    }

    .child-order-number {
        font-size: 20upx;
        color: #333;
        line-height: 1;
        padding-left: 56upx;
        padding-top: 24upx;
        box-sizing: border-box;

        view {
            border-bottom: 1px solid #eee;
        }
    }

    .commodity-container {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #eee;
        width: 640upx;
        margin: 0 auto;
        box-sizing: border-box;
        padding: 28upx 0;

        image {
            width: 144upx;
            height: 144upx;
            border: 1px solid #eee;
        }
    }

    .commodity-description-container {
        padding-left: 20upx;
        flex: 1;
    }

    .commodity-name {
        font-size: 24upx;
        color: #333;
    }

    .commodity-number,
    .commodity-specification {
        font-size: 20upx;
        color: #9b9b9b;
        line-height: 40upx;

        text {
            padding-right: 12upx;
        }
    }

    .commodity-money-container {
        display: flex;
        align-items: center;
        font-size: 28upx;
        padding-top: 12upx;
    }

    .commodity-money {
        color: #ff4005;
        flex: 1;
    }

    .child-order-total-container {
        padding: 32upx 60upx 0 72upx;
        border-bottom: 1px solid #eee;
    }

    .delivery-container {
        display: flex;
        font-size: 24upx;
    }

    .delivery-method {
        flex: 1;

        text:first-child {
            font-size: 28upx;
            padding-right: 20upx;
        }
    }

    .delivery-cost {
        text:first-child {
            padding-right: 20upx;
        }

        text:last-child {
            color: #ff4005;
        }
    }

    .child-order-total {
        display: flex;
        justify-content: flex-end;
        line-height: 88upx;
        font-size: 24upx;

        view:first-child {
            padding-right: 52upx;
        }

        text {
            font-size: 28upx;
        }
    }

    .order-pay-money-container {
        box-shadow: 0 4upx 8upx 0 rgba(0, 0, 0, 0.16);
        background-color: #fff;
    }

    .money-container {
        display: flex;
        align-items: center;
        padding: 28upx 36upx 28upx 72upx;
        font-size: 24upx;

        view {
            color: #333;

            text {
                color: #ff4005;
            }
        }

        view:first-child {
            flex: 1;
            text-align: right;
            padding-right: 44upx;
        }

        view:nth-child(2) {
            padding-right: 44upx;
        }

        view:last-child {
            font-size: 28upx;
        }
    }

    .action-container {
        display: flex;
        padding: 28upx 36upx 28upx 80upx;
        width: 100vw;
        background-color: #fff;
        box-sizing: border-box;

        view {
            width: 136upx;
            height: 56upx;
            text-align: center;
            line-height: 56upx;
            font-size: 28upx;
            border-radius: 36upx;
            border: 1px solid #ff4005;
            color: #ff4005;
            margin-right: 20upx;
        }

        .logistics {
            border: 1px solid #6dabff;
            color: #6dabff;
        }

        .delivery-btn {
            border: 1px solid #6DABFF;
            color: #6DABFF;
        }
    }


    .order-item-detail {
        background-color: #fff;
        font-size: 28upx;
        color: #333;
        line-height: 60upx;
        padding: 40upx 0 40upx 72upx;
        box-sizing: border-box;
        box-shadow: 0 4upx 8upx 0 rgba(0, 0, 0, 0.16);
        border-top: 1px solid #eee;
        margin: 12upx 0 0 0;

        &>view {
            display: flex;

            &>view:first-child {
                width: 212upx;
            }

            &>view:last-child {
                font-size: 24upx;
            }
        }
    }

    .delivery-search {
        position: relative;
        flex: 1;

        .delivery-more {
            position: absolute;
            right: 70upx;
            top: 0;
            width: 100upx;

            &:before {
                content: '';
                width: 24upx;
                height: 16upx;
                position: absolute;
                right: 0upx;
                top: 20upx;
                background: url(../../static/doble-arrow.png) no-repeat center center;
                background-size: 100% 100%;
                transform: rotate(-90deg);
            }
        }

        .delivery-more-show:before {
            transform: rotate(0);
        }
    }

    .remark-content {
        flex: 1;
        margin-right: 40upx;
        line-height: 1.4;
        padding-top: 10upx;
    }
</style>
