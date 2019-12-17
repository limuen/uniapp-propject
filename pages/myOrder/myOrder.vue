<template>
    <view class="my-order">
        <view class="order-nav-container">
            <view :class="navType === 'total' ? 'on' : ''" @tap="toggleHandle('total')">全部</view>
            <view :class="navType === 'pendingPayment' ? 'on' : ''" @tap="toggleHandle('pendingPayment')">待付款</view>
            <view :class="navType === 'pendingShip' ? 'on' : ''" @tap="toggleHandle('pendingShip')">待发货</view>
            <view :class="navType === 'pendingReceipt' ? 'on' : ''" @tap="toggleHandle('pendingReceipt')">待收货</view>
        </view>

        <view class="order-list-container" v-for="(item, listKey) of orderList" :key="listKey" v-show="navType === listKey">
            <view class="order-item-container" v-for="(val,index) in item.list" :key="val.id">
                <view class="order-number-container" @tap="toDetail(val)">
                    <view class="order-number-text">订单号：{{ val.identifier }}</view>
                    <view class="order-detail-text">查看详情</view>
                    <image src="/static/right2@2x.png" mode=""></image>
                </view>

                <view class="child-order-container">
                    <view>
                        <view class="child-order-number">分仓单号：{{ val.warehouseOrderList[0].identifier }}</view>
                        <view class="commodity-container">
                            <image :src="val.warehouseOrderList[0].orderCommoditysList[0].commodityImageUrl" mode=""></image>
                            <view class="commodity-description-container">
                                <view class="commodity-name">
                                    {{ val.warehouseOrderList[0].orderCommoditysList[0].commodityTitle }}
                                </view>
                                <view class="commodity-number">
                                    编码:{{ val.warehouseOrderList[0].orderCommoditysList[0].commodityIdentifier }}
                                </view>
                                <view class="commodity-specification">
                                    <text>
                                        颜色：{{ val.warehouseOrderList[0].orderCommoditysList[0].commodityColour }}
                                    </text>
                                    <text>
                                        尺码：{{ val.warehouseOrderList[0].orderCommoditysList[0].commoditySize }}
                                    </text>
                                    <text>仓库：{{ val.warehouseOrderList[0].warehouseName }}</text>
                                </view>
                                <view class="commodity-money-container">
                                    <view class="commodity-money">
                                        ￥{{ val.warehouseOrderList[0].orderCommoditysList[0].commodityPrice }}
                                    </view>
                                    <view class="commodity-quantity">
                                        x{{ val.warehouseOrderList[0].orderCommoditysList[0].quantity }}
                                    </view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>

                <view class="order-pay-money-container">
                    <view class="money-container">
                        <view>
                            配送费:
                            <text>￥{{ val.orderCost.freight }}</text>
                        </view>
                        <view>
                            合计:
                            <text>￥{{ val.orderCost.orderTotal }}</text>
                        </view>
                    </view>
                    <view class="action-container">
                        <view class="delivery-btn" v-if="val.status >= 4" @tap="handleDelivery(val)">查看物流</view>
                        <view v-if="val.status === 3" @tap="remindHandle">提醒发货</view>
                        <view v-else-if="val.status === 4" @tap="confirmReceipt(val,index)">确认收货</view>
                        <view v-else-if="val.status === 1" @tap="toPay(val,index)">立即付款</view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    import {
        getOrder,
        updateOrderStatus,
        payOrder,
        getJudgeOrder
    } from '@/api/order.js';
    export default {
        data() {
            return {
                navType: 'total',
                status: '',
                orderList: {
                    total: {
                        pageSize: 10,
                        pageNum: 1,
                        list: []
                    },
                    pendingPayment: {
                        pageSize: 10,
                        pageNum: 1,
                        list: []
                    },
                    pendingShip: {
                        pageSize: 10,
                        pageNum: 1,
                        list: []
                    },
                    pendingReceipt: {
                        pageSize: 10,
                        pageNum: 1,
                        list: []
                    }
                },
                isDestroy: false
            };
        },
        methods: {
            toggleHandle(key, isScrolled = false) {
                this.navType = key;
                const statusMap = {
                    total: '',
                    pendingPayment: 1,
                    pendingShip: 3,
                    pendingReceipt: 4
                };
                if (!isScrolled) {
                    this.orderList[key] = {
                        pageSize: 10,
                        pageNum: 1,
                        list: []
                    };
                }

                let obj = {
                    paging: true,
                    pageSize: this.orderList[key].pageSize,
                    pageNum: this.orderList[key].pageNum,
                    status: statusMap[key]
                };
                this.getOrder(obj, key, isScrolled);
            },
            async getOrder(params, key, isScrolled) {
                uni.showLoading({
                    title: '加载中'
                });
                let list = await getOrder(params).catch(() => {});
                uni.hideLoading();
                if (!list || (!list.orderInfoList && isScrolled)) return;
                list =
                    this.orderList[key].list.length < 10 ?
                    list.orderInfoList || [] :
                    this.orderList[key].list.concat(list.orderInfoList || []);
                this.$set(this.orderList[key], 'list', list);
            },
            remindHandle() {
                uni.showToast({
                    title: '提醒发货成功',
                    icon: 'none'
                });
            },
            toPay(val, index) {
                payOrder(val.id)
                    .then(response => {
                        uni.requestPayment({
                            provider: 'wxpay',
                            timeStamp: response.wxPayAppOrderResult.timeStamp,
                            nonceStr: response.wxPayAppOrderResult.nonceStr,
                            package: response.wxPayAppOrderResult.packageValue,
                            signType: response.wxPayAppOrderResult.signType,
                            paySign: response.wxPayAppOrderResult.paySign,
                            success: () => {
                                this.getPayResult(val.id, index)
                            },
                            complete: () => {}
                        });
                    })
                    .catch(() => {});
            },
            confirmReceipt(val, index) {
                let obj = {
                    id: val.id,
                    status: 5
                };
                updateOrderStatus(obj)
                    .then(res => {
                        if (this.navType === 'total') {
                            this.orderList[this.navType].list[index].status = 5
                        } else if (this.orderList.pendingReceipt.list.length) {
                            this.orderList.pendingReceipt = {
                                pageSize: 10,
                                pageNum: 1,
                                list: []
                            };
                            let obj = {
                                paging: true,
                                pageSize: 10,
                                pageNum: 1,
                                status: 4
                            };
                            this.getOrder(obj, this.navType);
                        }
                    })
                    .catch(() => {});
            },
            toDetail(val) {
                uni.navigateTo({
                    url: '../orderDetail/orderDetail?orderId=' + val.id
                });
            },
            handleDelivery(val) {
                let trackingNumber = val.warehouseOrderList[0].trackingNumber,
                    deliveryWay = val.warehouseOrderList[0].deliveryWay,
                    warehouseName = val.warehouseOrderList[0].warehouseName,
                    orderCommoditysList = JSON.stringify(val.warehouseOrderList[0].orderCommoditysList)

                uni.navigateTo({
                    url: `../delivery/delivery?trackingNumber=${trackingNumber}&deliveryWay=${deliveryWay}&orderCommoditysList=${orderCommoditysList}&warehouseName=${warehouseName}`
                })
            },
            getPayResult(orderId, index) {
                if (this.isDestroy) return
                getJudgeOrder(orderId).then(res => {
                    if (this.navType === 'total') {
                        this.orderList[this.navType].list[index].status = 3
                    } else if (this.orderList.pendingPayment.list.length) {
                        this.orderList.pendingPayment = {
                            pageSize: 10,
                            pageNum: 1,
                            list: []
                        };
                        let obj = {
                            paging: true,
                            pageSize: 10,
                            pageNum: 1,
                            status: 1
                        };
                        this.getOrder(obj, this.navType);
                    }
                }).catch((error) => {
                    if (error.data.status === 400) {
                        setTimeout(() => {
                            this.getPayResult(orderId, index)
                        }, 2000)
                    }
                })
            }
        },
        onLoad(options) {
            this.status = options.status;
            if (options.status == 1) {
                this.navType = 'pendingPayment';
            } else if (options.status == 3) {
                this.navType = 'pendingShip';
            } else {
                this.navType = 'total';
            }
        },
        onShow() {
            const statusMap = {
                total: '',
                pendingPayment: 1,
                pendingShip: 3,
                pendingReceipt: 4
            };
            let obj = {
                paging: true,
                pageSize: 10,
                pageNum: 1,
                status: statusMap[this.navType]
            };
            this.orderList[this.navType] = {
                pageSize: 10,
                pageNum: 1,
                list: []
            };
            this.getOrder(obj, this.navType);
        },
        onReachBottom() {
            this.orderList[this.navType].pageNum++;
            this.toggleHandle(this.navType, true);
        },
        onUnload() {
            this.isDestroy = true
        }
    };
</script>

<style lang="scss">
    page {
        background-color: #eee;
    }

    .order-nav-container {
        display: flex;
        justify-content: space-around;
        font-size: 28upx;
        color: #333;
        line-height: 120upx;
        background-color: #fff;

        view {
            position: relative;
        }

        .on:before {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 24upx;
            width: 24upx;
            height: 4upx;
            background-color: #6dabff;
            transform: translateX(-50%);
            border-radius: 1px;
        }
    }

    .order-list-container {
        height: calc(100vh - 120upx - 1px);
        margin-top: 1px;
    }

    .order-item-container {
        margin-bottom: 10upx;
    }

    .order-number-container {
        display: flex;
        align-items: center;
        font-size: 28upx;
        color: #4a4a4a;
        padding: 32upx 36upx;
        margin-top: 12upx;
        background-color: #fff;
        border-bottom: 1px solid #eee;

        image {
            width: 12upx;
            height: 24upx;
            padding-left: 22upx;
            transition: 0.5 all ease;
        }

        .order-show {
            transform: translateY(-6upx) rotate(90deg);
        }

        view:first-child {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .order-detail-text {
        font-size: 24upx;
        color: #9b9b9b;
    }

    .child-order-container {
        background-color: #fff;
    }

    .child-order-number {
        font-size: 24upx;
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
        padding: 20upx 0;

        image {
            width: 144upx;
            height: 144upx;
            border: 1px solid #eee;
        }
    }

    .commodity-description-container {
        padding-left: 32upx;
    }

    .commodity-name {
        font-size: 28upx;
        color: #333;
    }

    .commodity-number,
    .commodity-specification {
        font-size: 24upx;
        color: #9b9b9b;
        line-height: 40upx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        text {
            padding-right: 12upx;
        }
    }

    .commodity-number {
        padding-top: 12upx;
    }

    .commodity-money-container {
        display: flex;
        align-items: center;
        font-size: 28upx;
        padding-top: 12upx;

        view:last-child {
            font-size: 24upx;
        }
    }

    .commodity-money {
        color: #ff4005;
        flex: 1;
    }

    .order-pay-money-container {
        background-color: #fff;
        padding: 0 54upx;
    }

    .money-container {
        display: flex;
        align-items: center;
        padding: 20upx 52upx 20upx 72upx;
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

        view:last-child {
            font-size: 28upx;
        }
    }

    .action-container {
        display: flex;
        justify-content: flex-end;
        padding: 4upx 36upx 24upx 0;

        view {
            width: 160upx;
            height: 76upx;
            text-align: center;
            line-height: 76upx;
            font-size: 28upx;
            color: #fff;
            background-color: #ff4005;
            margin-left: 28upx;
            border-radius: 8upx;
        }

        .logistics {
            background-color: #6dabff;
        }

        .delivery-btn {
            background-color: #6DABFF;
        }
    }
</style>
