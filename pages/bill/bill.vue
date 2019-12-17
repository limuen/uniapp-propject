<template>
    <view>
        <image src="/static/bill-bg.png" mode="" class="bg-img"></image>
        <view class="bill-container">
            <view class="user-info-container">
                <image :src="userInfo.userInfo.icon || '/static/default-avatar.png'" mode=""></image>
                <view class="user-name">{{ userInfo.userInfo.nickName }}</view>
            </view>

            <view class="total-container">
                <view class="wallet">
                    <view>{{kuAmount.toFixed(2)}}</view>
                    <view>库钱包</view>
                </view>
                <view class="unpaid" @tap="toOrder(1)">
                    <view>{{ userInfo.noPaidCount || 0 }}</view>
                    <view>未付款</view>
                </view>
                <view class="total-order" @tap="toOrder('')">
                    <view>{{ userInfo.allOrderCount || 0 }}</view>
                    <view>全部订单</view>
                </view>
            </view>

            <view class="tab-container">
                <view class="tab-nav">
                    <view :class="billType == 'consumption' ? 'tab-on' : ''" @tap="tabToggle('consumption')">
                        消费账单
                    </view>
                    <!-- <view :class="billType == 'recharge' ? 'tab-on' : ''" @tap="tabToggle('recharge')">充值记录</view> -->
                </view>

                <view class="tab-content">
                    <view class="data-container">
                        <view class="date-btn-container">
                            <view class="selected-btn" :class="isConfirm ? 'border-radius-60' : ''" @tap="toggleDateType">
                                <view v-if="this.dateType !== 'default' && isConfirm">
                                    <view class="time-height">{{ query.startTime }}</view>
                                    <view class="time-height" v-if="query.startTime !== query.endTime">
                                        {{ query.endTime }}
                                    </view>
                                </view>
                                <view v-else>{{ dateText }}</view>
                                <image v-if="dateType === 'default'" src="/static/triangle@2x.png" mode=""></image>
                                <image v-else src="/static/arrow.png" class="selected-month" mode=""></image>
                            </view>
                            <view class="bill-total" v-if="dateType === 'default'">支出 ¥{{ totalAmount }}</view>
                            <view class="confirm" v-else @tap="dateConfirm">完成</view>
                        </view>

                        <view class="data-picker-container" v-if="dateType !== 'default'">
                            <picker-view indicator-class="picker-selected" :value="value" @change="firstDateChange">
                                <picker-view-column>
                                    <view class="item" v-for="(item, index) in years" :key="index">{{ item }}</view>
                                </picker-view-column>
                                <picker-view-column>
                                    <view class="item" v-for="(item, index) in months" :key="index">{{ item }}</view>
                                </picker-view-column>
                            </picker-view>
                            <view class="to" v-if="dateType === 'interval'">至</view>
                            <picker-view indicator-class="picker-selected" :value="value" @change="secondDateChange"
                                v-if="dateType === 'interval'">
                                <picker-view-column>
                                    <view class="item" v-for="(item, index) in years" :key="index">{{ item }}</view>
                                </picker-view-column>
                                <picker-view-column>
                                    <view class="item" v-for="(item, index) in months" :key="index">{{ item }}</view>
                                </picker-view-column>
                            </picker-view>
                        </view>
                    </view>

                    <view class="consumption-container" v-if="billType === 'consumption'">
                        <scroll-view scroll-y class="scroll-container" @scrolltolower="consumptionScroll" :style="{ height: scrollHeight }"
                            :scroll-top="scrollTop">
                            <view class="consumption-list-container">
                                <view class="consumption-item-container" v-for="item in billList" :key="item.id">
                                    <view class="consumption-order-number">订单号: {{ item.identifier }}</view>
                                    <view class="consumption-order-detail-container">
                                        <image :src="item.warehouseOrderList[0].orderCommoditysList[0].commodityImageUrl"
                                            mode=""></image>
                                        <view class="commodity-detail">
                                            <view class="commodity-name">
                                                {{ item.warehouseOrderList[0].orderCommoditysList[0].commodityTitle }}
                                            </view>
                                            <view class="commodity-numbering">
                                                编码:{{
                                                    item.warehouseOrderList[0].orderCommoditysList[0]
                                                        .commodityIdentifier
                                                }}
                                            </view>
                                            <view class="consumption-date">{{ item.createdTime | formatTime }}</view>
                                        </view>
                                        <view class="consumption-action">
                                            <view class="order-money">-{{ item.amount }}</view>
                                            <view class="detail-handler" @tap="detailHandle(item)">订单详情</view>
                                        </view>
                                    </view>
                                </view>
                            </view>
                            <view class="scroll-padding"></view>
                        </scroll-view>
                    </view>

                    <view class="recharge-container" v-else>
                        <scroll-view scroll-y class="scroll-container" :class="dateType === 'default' ? 'scroll-container-h' : ''">
                            <view class="recharge-item-container" v-for="item in 5" :key="item">
                                <view class="recharge-title">
                                    <text>微信充值</text>
                                    <text>充值时间：2019-01-25 218:15:00</text>
                                </view>
                                <view class="recharge-money">¥8591.00</view>
                            </view>
                        </scroll-view>
                    </view>
                </view>
            </view>
        </view>

        <tarbar-nav :tabbar="tabBar" :cartsNum="cartsNum"></tarbar-nav>
    </view>
</template>

<script>
    import {
        getOrder
    } from '@/api/order.js';
    import {
        getUserInfo,
        orderStatus
    } from '@/api/login.js';
    import TabBar from '@/components/tabBar.vue';
    export default {
        data() {
            const date = new Date();
            const years = [];
            const year = date.getFullYear();
            const months = [];
            const month = date.getMonth() + 1;
            for (let i = 1990; i <= date.getFullYear(); i++) {
                years.push(i);
            }
            for (let i = 1; i <= 12; i++) {
                months.push(i);
            }
            return {
                dateText: '本月',
                dateType: 'default', //'interval' 'default' 'single'
                startTime: month < 10 ? year + '-0' + month : year + '-' + month,
                endTime: month < 10 ? year + '-0' + month : year + '-' + month,
                years,
                year,
                months,
                month,
                value: [year, month - 1],
                billType: 'consumption',
                totalAmount: 0,
                isConfirm: false,
                billList: [],
                query: {
                    startTime: month < 10 ? year + '-0' + month : year + '-' + month,
                    endTime: month < 10 ? year + '-0' + month : year + '-' + month,
                    paging: true,
                    pageSize: 10,
                    pageNum: 1,
                    statusStr: '2,3,4,5,6,7,8,9,10,11'
                },
                userInfo: {},
                tabBar: this.$tabBar,
                cartsNum: 0,
                scrollTop: 0,
                kuAmount: 0
            };
        },
        components: {
            tarbarNav: TabBar
        },
        computed: {
            scrollHeight() {
                let {
                    screenHeight,
                    statusBarHeight
                } = uni.getSystemInfoSync();
                let num = this.dateType === 'default' ? 558 : 738;
                return screenHeight - statusBarHeight - uni.upx2px(num) + 'px';
            }
        },
        methods: {
            firstDateChange(e) {
                const val = e.detail.value;
                this.year = this.years[val[0]];
                this.month = this.months[val[1]] < 10 ? '0' + this.months[val[1]] : this.months[val[1]];
                this.startTime = this.year + '-' + this.month;
            },
            secondDateChange(e) {
                const val = e.detail.value;
                this.year = this.years[val[0]];
                this.month = this.months[val[1]] < 10 ? '0' + this.months[val[1]] : this.months[val[1]];
                this.endTime = this.year + '-' + this.month;
            },
            tabToggle(key) {
                this.billType = key;
            },
            // 切换日期选择类型
            toggleDateType() {
                this.isConfirm = false;
                this.value = [this.year, this.month - 1];
                if (this.dateType === 'default') {
                    this.dateType = 'single';
                    this.dateText = '按月选择';
                    return;
                }
                if (this.dateType === 'single') {
                    this.dateType = 'interval';
                    this.dateText = '按月选择';
                    this.endTime = this.startTime
                    return;
                }
                if (this.dateType === 'interval') {
                    this.dateType = 'default';
                    if (new Date().getMonth() + 1 !== +this.month) {
                        this.isConfirm = true;
                    }
                    this.dateText = '本月';
                    return;
                }
            },
            // 根据日期查询账单
            dateConfirm() {
                this.$set(this.query, 'startTime', this.startTime);
                if (this.dateType === 'single') {
                    this.$set(this.query, 'endTime', this.startTime);
                } else {
                    this.$set(this.query, 'endTime', this.endTime);
                }
                this.isConfirm = true;
                this.dateType = 'default';
                this.query.pageNum = 1;
                this.totalAmount = 0;
                this.scrollTop = 10;
                this.$nextTick(function() {
                    this.scrollTop = 0;
                });
                this.billList = [];
                this.getOrderList(this.query);
            },
            // 获取账单列表
            async getOrderList(params) {
                let query = Object.assign({}, params);
                let startTime = new Date(query.startTime),
                    endTime = new Date(query.endTime),
                    endMonth = new Date(query.endTime).getMonth() + 1,
                    endDay = new Date(endTime.getFullYear(), endMonth, 0).getDate();
                if (startTime.getTime() > endTime.getTime()) {
                    uni.showToast({
                        title: '开始时间不可大于结束时间',
                        icon: 'none'
                    });
                    return;
                }
                if (startTime.getTime() > new Date().getTime()) {
                    uni.showToast({
                        title: '开始时间不可大于当前时间',
                        icon: 'none'
                    });
                    return;
                }
                uni.showLoading({
                    title: '加载中'
                });
                endMonth = endMonth < 10 ? '0' + endMonth : endMonth;
                query.startTime = query.startTime + '-01 00:00:00';
                query.endTime = `${endTime.getFullYear()}-${endMonth}-${endDay} 23:59:59`;
                let obj = await getOrder(query).catch(() => {});
                uni.hideLoading();
                if (!obj) return;
                this.billList = !this.billList.length ?
                    obj.orderInfoList || [] :
                    this.billList.concat(obj.orderInfoList || []);
                this.totalAmount = obj.totalAmount || 0;
            },
            consumptionScroll() {
                if (this.billList.length % 10 !== 0) return;
                this.query.pageNum++;
                this.getOrderList(this.query);
            },
            detailHandle(item) {
                uni.navigateTo({
                    url: '../orderDetail/orderDetail?orderId=' + item.id
                });
            },
            async getUserInfo() {
                this.userInfo = await getUserInfo().catch(error => {
                    if (error.statusCode == 401) {
                        this.userInfo = {};
                        this.billList = [];
                    }
                });
                if (!this.userInfo) return;
                if (this.userInfo.userInfo.icon == 'https://qx-oss-master.oss-cn-hangzhou.aliyuncs.com/-') {
                    this.userInfo.userInfo.icon = '';
                }
            },
            toOrder(n) {
                uni.navigateTo({
                    url: '../myOrder/myOrder?status=' + n
                });
            },
            async getWalletBalance() {
                let {
                    kuAmount
                } = (await orderStatus().catch(() => {})) || {kuAmount:0}
                this.kuAmount = kuAmount
            }
        },
        filters: {
            formatTime(time) {
                return time.split(' ')[1];
            }
        },
        async onShow() {
            await this.getUserInfo();
            await this.getWalletBalance()
            this.totalAmount = 0;
            this.query.pageNum = 1;
            this.billList = [];
            this.scrollTop = 10;
            this.$nextTick(function() {
                this.scrollTop = 0;
            });
            this.getOrderList(this.query);
            this.cartsNum = uni.getStorageSync('cartsNum');
        }
    };
</script>

<style lang="scss">
    .bg-img {
        width: 100vw;
        height: 530upx;
    }

    .bill-container {
        padding-top: 14upx;
        width: 100vw;
        position: fixed;
        left: 0;
        top: 0;
    }

    .user-info-container {
        display: flex;
        align-items: center;
        padding-left: 68upx;
        box-sizing: border-box;

        image {
            width: 148upx;
            height: 148upx;
        }

        .user-name {
            font-size: 36upx;
            color: #fff;
            padding-left: 36upx;
            width: 300upx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .total-container {
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin-top: 44upx;
    }

    .wallet,
    .unpaid,
    .total-order {
        font-size: 28upx;
        text-align: center;
        color: #fff;

        view:first-child {
            font-size: 32upx;
        }

        view:last-child {
            line-height: 50upx;
        }
    }

    .tab-container {
        padding-top: 10upx;

        .tab-nav {
            display: flex;
            justify-content: center;
            font-size: 32upx;
            color: #fff;
            padding-top: 30upx;

            view {
                position: relative;
                padding-bottom: 12upx;
            }

            // view:last-child {
            //     margin-left: 86upx;
            // }
            .tab-on:before {
                content: '';
                position: absolute;
                left: 50%;
                bottom: 0;
                transform: translateX(-50%);
                width: 24upx;
                height: 4upx;
                background-color: #fff;
                border-radius: 1px;
            }
        }

        .data-container {
            width: 686upx;
            margin: 40upx auto 20upx auto;
            padding: 40upx 60upx;
            box-sizing: border-box;
            background-color: #fff;
            box-shadow: 0 0 20upx 0 rgba(0, 0, 0, 0.2);
            border-radius: 16upx;
        }

        .date-btn-container {
            display: flex;
            align-items: center;
            font-size: 36upx;
            color: #262628;
        }

        .selected-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10upx 38upx;
            border-radius: 30upx;
            background-color: #e8e8e8;
            font-size: 24upx;
            color: #262628;

            image {
                width: 16upx;
                height: 12upx;
                margin-left: 12upx;
            }

            .selected-month {
                width: 32upx;
                height: 24upx;
            }
        }

        .border-radius-60 {
            border-radius: 60upx;
        }

        .bill-total,
        .confirm {
            text-align: right;
            flex: 1;
        }

        .confirm {
            font-size: 28upx;
            color: #6dabff;
        }

        .data-picker-container {
            height: 150upx;
            padding-top: 30upx;
            display: flex;
            justify-content: center;

            picker-view {
                height: 100%;
                width: 190upx;
                font-size: 28upx;
                line-height: 50upx;
                text-align: center;
            }

            .picker-selected {
                height: 50upx;
                border: 1px solid #ccc;
                border-left: none;
                border-right: none;
            }

            .to {
                padding: 0 28upx;
                font-size: 28upx;
                color: #333;
                line-height: 150upx;
            }
        }

        .scroll-container {
            view.recharge-item-container:last-child {
                margin-bottom: 80upx;
            }
        }

        .recharge-item-container {
            width: 686upx;
            height: 218upx;
            box-shadow: 0 0 20upx 0 rgba(0, 0, 0, 0.2);
            border-radius: 16upx;
            background-color: #fff;
            margin: 20upx auto 0 auto;
            color: #262628;
        }

        .recharge-title {
            display: flex;
            align-items: center;
            width: 626upx;
            margin: 0 auto;
            line-height: 72upx;
            border-bottom: 1px solid #efeff4;

            text:first-child {
                font-size: 28upx;
            }

            text:last-child {
                flex: 1;
                font-size: 20upx;
                text-align: right;
            }
        }

        .recharge-money {
            font-size: 48upx;
            line-height: 144upx;
            text-align: center;
        }

        .consumption-list-container {
            width: 686upx;
            box-shadow: 0 0 20upx 0 rgba(0, 0, 0, 0.2);
            margin: 20upx auto 40upx auto;
            padding: 0 10upx;
            box-sizing: border-box;
            border-radius: 16upx;
            background-color: #fff;
            margin-bottom: 260upx;
        }

        .scroll-padding {
            height: 1px;
        }

        .consumption-item-container {
            border-top: 1px solid #efeff4;

            image {
                width: 76upx;
                height: 76upx;
                border-radius: 50%;
                margin-left: 10upx;
            }
        }

        .consumption-order-number {
            line-height: 80upx;
            font-size: 24upx;
            color: #333;
            padding-left: 28upx;
            border-bottom: 1px solid #eee;
        }

        .consumption-order-detail-container {
            display: flex;
            align-items: center;
            padding: 40upx 0;
        }

        .commodity-detail {
            width: 380upx;
            margin: 0 24upx;
        }

        .commodity-name {
            font-size: 32upx;
            color: #333;
        }

        .commodity-numbering {
            font-size: 28upx;
            color: #9b9b9b;
            line-height: 48upx;
        }

        .consumption-date {
            font-size: 28upx;
            color: #333;
        }

        .order-money {
            padding-bottom: 34upx;
            text-align: center;
            font-size: 40upx;
            color: #262628;
        }

        .detail-handler {
            width: 120upx;
            height: 52upx;
            background-color: #6dabff;
            font-size: 28upx;
            line-height: 52upx;
            text-align: center;
            border-radius: 8upx;
            font-size: 24upx;
            color: #fff;
            margin-top: 8upx;
        }

        .time-height {
            line-height: 1;
        }
    }
</style>
