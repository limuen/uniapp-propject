<template>
    <view class="notice-container">
        <view class="notice-content">
            <view>ArriveGuide全新升级啦！</view>
            <view>尊敬的各位客户：</view>
            <view class="text-indent-2">大家好！</view>
            <view class="text-indent-2">首先感谢各位对我司的鼎力支持与厚爱！</view>
            <view class="text-indent-2">在本次版本更新后：</view>
            <view class="text-indent-4">界面更加简洁</view>
            <view class="text-indent-4">下单速度更快捷</view>
            <view class="text-indent-4">在库存界面可以直接点击商品加入购物车</view>
            <view class="text-indent-2">因为发票选择暂未开放，请大家下单之后联系客服详谈。</view>
            <view class="text-indent-2">本次改版，如若有使用问题，请联系我们的客服电话：13336098928。</view>
            <view class="text-indent-2">给大家带来不便之处，敬请见谅。</view>
            <view class="text-indent-2" style="padding-top: 20px;">祝各位：生意兴隆！</view>
            <view class="text-indent-6">财源广进！</view>
        </view>
        <view class="notice-footer">
            <view>杭州ArriveGuide有限公司</view>
            <view>2019年6月3日</view>
        </view>
        <view class="notice-action" @tap="back">我知道了</view>
    </view>
</template>

<script>
export default {
    data() {
        return {};
    },
    methods: {
        back() {
            uni.navigateBack({});
        }
    }
};
</script>

<style lang="scss">
.notice-container {
    color: #333;
    padding: 80upx 64upx;
}

.notice-content {
    font-size: 28upx;
    line-height: 1.6;
    padding-bottom: 60upx;
    view:first-child{
        padding-bottom: 40upx;
    }
}
.text-indent-2{
    text-indent: 2em;
}
.text-indent-4{
    text-indent: 4em;
}
.text-indent-6{
    text-indent: 6em;
}
.notice-footer {
    text-align: right;
    font-size: 24upx;
}
.notice-action {
    width: 700upx;
    height: 100upx;
    text-align: center;
    line-height: 100upx;
    font-size: 28upx;
    color: #fff;
    background-color: #6dabff;
    box-shadow: 0 4upx 20upx 0 rgba(0, 0, 0, 0.1);
    border-radius: 8upx;
    position: fixed;
    left: 50%;
    bottom: 40upx;
    transform: translateX(-50%);
}
</style>
