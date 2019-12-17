<template>
    <view>
        <view class="commodity-list-container">
            <template v-for="(val,index) in orderCommoditysList">
                <view v-if="index == 0 || (index > 0 && commodityShow)" class="commodity-container" :key="val.id">
                    <image :src="val.commodityImageUrl" mode=""></image>
                    <view class="commodity-description-container">
                        <view class="commodity-name">{{ val.commodityTitle }}</view>
                        <view class="commodity-number">编码:{{ val.commodityIdentifier }}</view>
                        <view class="commodity-specification">
                            <text>颜色：{{ val.commodityColour }}</text>
                            <text>尺码：{{ val.commoditySize }}</text>
                            <text>仓库：{{ warehouseName }}</text>
                        </view>
                        <view class="commodity-money-container">
                            <view class="commodity-money">￥{{ val.commodityPrice }}</view>
                            <view class="commodity-quantity">x{{ val.quantity }}</view>
                        </view>
                    </view>
                </view>
            </template>

        </view>

        <view class="more" @tap="handleMore" v-if="orderCommoditysList.length > 1">
            {{showText}}商品
            <image src="../../static/doble-arrow.png" :class="commodityShow ? 'rotate':''" mode=""></image>
        </view>

        <view class="delivery-container">
            <view class="delivery-way">
                <image src="../../static/delivery-icon.png" mode=""></image>
                <view class="delivery-way-right">
                    <view>物流信息 <span>{{deliveryWay}}</span></view>
                    <view>快递单号 <span>{{trackingNumber}}</span> </view>
                </view>
            </view>
            <view class="delivery-message-container" v-for="item in deliveryArr" :key="item.time">
                <view class="delivery-message-detail">
                    {{item.context}}
                </view>
                <view class="delivery-message-time">
                    {{item.time}}
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
        getTracks
    } from '@/api/order.js';
    export default {
        data() {
            return {
                orderCommoditysList: [],
                deliveryArr: [],
                commodityShow: false,
                showText: '显示剩余',
                deliveryWay: '',
                warehouseName: '',
                trackingNumber: ''
            }
        },
        methods: {
            handleMore() {
                this.commodityShow = !this.commodityShow
                this.showText = this.commodityShow ? '收起' : '显示剩余'
            }
        },
        async onLoad(options) {
            uni.showLoading({
                title: '加载中'
            });
            let deliveryArr = await getTracks(options.trackingNumber).catch(() => {});
            this.deliveryArr = deliveryArr || []
            this.orderCommoditysList = JSON.parse(options.orderCommoditysList)
            this.deliveryWay = options.deliveryWay
            this.warehouseName = options.warehouseName
            this.trackingNumber = options.trackingNumber
            uni.hideLoading();
        }
    }
</script>

<style lang="scss">
    page {
        background-color: #f5f5f5;
        padding-bottom: 100upx;
    }

    .commodity-list-container {
        background-color: #fff;
    }

    .commodity-container {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #eee;
        width: 690upx;
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

    .more {
        background-color: #fff;
        font-size: 24upx;
        height: 104upx;
        text-align: center;
        margin: 10upx 0 18upx 0;
        line-height: 70upx;

        image {
            width: 28upx;
            height: 20upx;
            display: block;
            margin: 0 auto;
        }
    }

    .rotate {
        transform: rotate(180deg);
    }

    .delivery-container {
        background-color: #fff;

        view:last-child {
            border-bottom: none;
        }
    }

    .delivery-way {
        display: flex;
        align-items: center;
        height: 132upx;
        padding-left: 40upx;
        box-sizing: border-box;
        font-size: 24upx;
        border-bottom: 4upx solid #e2e2e2;

        image {
            width: 68upx;
            height: 64upx;
        }
    }

    .delivery-way-right {
        padding-left: 20upx;

        view {
            color: #a6a5a5;
        }

        view:nth-child(2) {
            padding-top: 12upx;
        }

        span {
            color: #333;
            padding-left: 20upx;
        }
    }

    .delivery-message-container {
        padding: 20upx 30upx 20upx 84upx;
        box-sizing: border-box;
        font-size: 24upx;
        border-bottom: 1px solid #e2e2e2;
        width: 710upx;
        margin: 0 auto;
    }

    .delivery-message-detail {
        position: relative;

        &:before {
            content: '';
            width: 16upx;
            height: 16upx;
            background-color: #6dabff;
            border-radius: 50%;
            position: absolute;
            left: -40upx;
            top: 8upx;
        }
    }

    .delivery-message-time {
        font-size: 20upx;
        color: #a6a5a5;
        padding-top: 8upx;
    }
</style>
