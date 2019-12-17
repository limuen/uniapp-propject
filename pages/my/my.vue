<template>
    <view class="my-container">
        <view class="bg">
            <view class="user-info-container" @tap="toLogin">
                <image :src="userInfo.userInfo.icon || '/static/default-avatar.png'" mode=""></image>
                <view class="user-name">
                    <view v-if="updateText === '修改'">{{ userInfo.userInfo.nickName }}</view>
                    <input type="text" :focus="isFocus" :value="userInfo.userInfo.nickName" v-else @input="userNameChange" />
                </view>
                <view class="update" @tap="updateUserName" v-if="userInfo.userInfo.nickName !== '未登录'">
                    <image src="/static/xiugai-2.png" mode=""></image>
                    <text>{{ updateText }}</text>
                </view>
            </view>

            <view class="total-container">
                <view class="wallet">
                    <view>{{kuAmount.toFixed(2)}}</view>
                    <view>库钱包</view>
                </view>
                <view class="unpaid">
                    <view>{{ userInfo.noPaidCount || 0 }}</view>
                    <view>未付款</view>
                </view>
                <view class="total-order">
                    <view>{{ userInfo.allOrderCount || 0 }}</view>
                    <view>全部订单</view>
                </view>
            </view>
        </view>

        <view class="order-tab">
            <view class="order-tab-item" @tap="toOrder(1)">
                <image src="/static/qianbao.png" class="icon1" mode=""></image>
                <view>待付款</view>
            </view>
            <view class="order-tab-item" @tap="toOrder(3)">
                <image src="/static/wodefabu.png" class="icon2" mode=""></image>
                <view>待发货</view>
            </view>
            <view class="order-tab-item" @tap="toOrder('')">
                <image src="/static/zhangdan.png" class="icon3" mode=""></image>
                <view>全部订单</view>
            </view>
        </view>

        <view class="action-list-container">
            <view class="action-item-container" @tap="toAddress">
                <view>收货地址</view>
                <image src="/static/right2@2x.png" mode=""></image>
            </view>
            <!-- <view class="action-item-container" @tap="toInvoice">
                <view>发票管理</view>
                <image src="/static/right2@2x.png" mode=""></image>
            </view> -->
            <view class="action-item-container" v-if="userInfo.userInfo.nickName !== '未登录'" @tap="logout">
                <view>退出账号</view>
                <image src="/static/right2@2x.png" mode=""></image>
            </view>
            <view class="action-item-container" v-else @tap="toLogin">
                <view>登录</view>
                <image src="/static/right2@2x.png" mode=""></image>
            </view>
        </view>
        <tarbar-nav :tabbar="tabBar" :cartsNum="cartsNum"></tarbar-nav>
    </view>
</template>

<script>
    import {
        getUserInfo,
        logout,
        updateUserInfo,
        orderStatus
    } from '@/api/login.js';
    import TabBar from '@/components/tabBar.vue';
    export default {
        data() {
            return {
                updateText: '修改',
                isFocus: false,
                userName: '',
                userInfo: {
                    userInfo: {
                        nickName: '未登录'
                    }
                },
                tabBar: this.$tabBar,
                cartsNum: 0,
                kuAmount: 0
            };
        },
        components: {
            tarbarNav: TabBar
        },
        methods: {
            async updateUserName() {
                if (this.updateText === '完成') {
                    this.userInfo.userInfo.nickName = this.userName;
                    await updateUserInfo(this.userInfo.userInfo).catch(() => {});
                    await this.getUserInfo().catch(() => {});
                }
                this.updateText = this.updateText === '完成' ? '修改' : '完成';
                this.isFocus = this.isFocus ? false : true;
            },
            userNameChange(e) {
                this.userName = e.detail.value;
            },
            toOrder(n) {
                if (this.userInfo.userInfo.nickName === '未登录') {
                    this.toLogin();
                } else {
                    uni.navigateTo({
                        url: '../myOrder/myOrder?status=' + n
                    });
                }
            },
            toAddress() {
                if (this.userInfo.userInfo.nickName === '未登录') {
                    this.toLogin();
                } else {
                    uni.navigateTo({
                        url: '../addressList/addressList'
                    });
                }
            },
            toInvoice() {
                if (this.userInfo.userInfo.nickName === '未登录') {
                    this.toLogin();
                } else {
                    uni.navigateTo({
                        url: '../invoice/invoice'
                    });
                }
            },
            async getUserInfo() {
                this.userInfo = (await getUserInfo().catch(() => {})) || {
                    userInfo: {
                        nickName: '未登录'
                    }
                };
                if (this.userInfo.userInfo.icon == 'https://qx-oss-master.oss-cn-hangzhou.aliyuncs.com/-') {
                    this.userInfo.userInfo.icon = '';
                }
                this.userName = this.userInfo.userInfo.nickName;
            },
            toLogin() {
                if (this.userInfo.userInfo.nickName !== '未登录') return;
                uni.navigateTo({
                    url: '../login/login'
                });
            },
            logout() {
                uni.clearStorageSync();
                this.cartsNum = 0;
                logout();
                this.kuAmount = 0;
                this.userInfo = {
                    userInfo: {
                        nickName: '未登录'
                    }
                };
            },
            async getWalletBalance() {
                let {
                    kuAmount
                } = (await orderStatus().catch(() => {})) || {
                    kuAmount: 0
                }
                this.kuAmount = kuAmount
            }
        },
        onShow() {
            this.getUserInfo();
            this.getWalletBalance()
            this.cartsNum = uni.getStorageSync('cartsNum');
        }
    };
</script>

<style lang="scss">
    .bg {
        background-color: #6dabff;
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
            line-height: 1;
            font-size: 36upx;
            color: #fff;
            padding-left: 36upx;

            input,
            view {
                width: 200upx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .update {
            font-size: 28upx;
            color: #fff;
            display: flex;
            align-items: center;
            margin-left: 40upx;

            image {
                width: 22upx;
                height: 22upx;
                margin-right: 4upx;
            }
        }
    }

    .total-container {
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin-top: 44upx;
        padding-bottom: 40upx;
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

    .order-tab {
        display: flex;
        align-items: center;
        justify-content: space-around;
        font-size: 28upx;
        color: #555;
        text-align: center;
        padding: 56upx 0;
        line-height: 50upx;

        &>view:first-child {
            view {
                padding-top: 4upx;
            }
        }
    }

    .icon1 {
        width: 84upx;
        height: 80upx;
    }

    .icon2 {
        width: 84upx;
        height: 84upx;
    }

    .icon3 {
        width: 76upx;
        height: 84upx;
    }

    .action-item-container {
        display: flex;
        align-items: center;
        padding: 0 32upx;
        height: 88upx;
        font-size: 28upx;
        color: #555;

        view {
            flex: 1;
        }

        image {
            width: 20upx;
            height: 32upx;
        }
    }
</style>
