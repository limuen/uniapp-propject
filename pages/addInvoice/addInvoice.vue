<template>
    <view class="add-invoice-container">
        <view class="add-container">
            <view>
                <text>发票抬头</text>
                <input
                    type="text"
                    :value="detail.title"
                    placeholder-class="placeholder"
                    @input="titleChange"
                    placeholder="请输入发票抬头"
                />
            </view>
            <view>
                <text>邮箱地址</text>
                <input
                    type="text"
                    :value="detail.email"
                    placeholder-class="placeholder"
                    @input="emailChange"
                    placeholder="请输入邮箱地址"
                />
            </view>
        </view>

        <view class="btn-container"><view class="btn" @tap="confirm">确定</view></view>
    </view>
</template>

<script>
import { addInvoice, updateInvoice } from '@/api/invoice.js';
export default {
    data() {
        return {
            status: 'add',
            detail: {
                defaultEnable: 0
            },
            isFirst: true
        };
    },
    methods: {
        titleChange(e) {
            this.$set(this.detail, 'title', e.detail.value);
        },
        emailChange(e) {
            this.$set(this.detail, 'email', e.detail.value);
        },
        confirm() {
            if (!this.isFirst) {
                uni.showToast({
                    title: '请不要重复提交'
                });
                return;
            }
            let obj = Object.assign({}, this.detail),
                regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            delete obj.isEdit;
            if (!obj.title) {
                uni.showToast({
                    title: '请输入发票抬头',
                    icon: 'none'
                });
                return;
            }
            if (!regEmail.test(obj.email)) {
                uni.showToast({
                    title: '请输入正确的邮箱',
                    icon: 'none'
                });
                return;
            }
            this.isFirst = false;
            if (this.status === 'add') {
                addInvoice(obj)
                    .then(() => {
                        uni.navigateBack({});
                    })
                    .catch(() => {
                        this.isFirst = true;
                    });
            } else {
                updateInvoice(obj)
                    .then(() => {
                        uni.navigateBack({});
                    })
                    .catch(() => {
                        this.isFirst = true;
                    });
            }
        }
    },
    onLoad(options) {
        if (options.detail) {
            this.detail = JSON.parse(options.detail);
            this.status = 'update';
            uni.setNavigationBarTitle({
                title: '发票编辑'
            });
        }
    }
};
</script>

<style lang="scss">
page {
    padding-top: 20upx;
    box-sizing: border-box;
    background-color: #eee;
}
.add-container {
    margin-bottom: 12upx;
    padding: 32upx 32upx;
    font-size: 24upx;
    background-color: #fff;
    view {
        display: flex;
        align-items: center;
        height: 84upx;
    }
    text {
        padding-right: 20upx;
    }
    input {
        width: 400upx;
        height: 52upx;
        line-height: 52upx;
        border-bottom: 1px solid #ccc;
        padding-left: 12upx;
    }
}
.btn-container {
    height: calc(100vh - 184upx - 20upx - 12upx);
    background-color: #fff;
}
.btn {
    position: fixed;
    left: 50%;
    bottom: 40upx;
    transform: translateX(-50%);
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

.placeholder {
    font-size: 24upx;
    color: #e2e2e2;
}
</style>
