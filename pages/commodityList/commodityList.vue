<template>
    <view v-if="navList.length !== 0">
        <view class="commodity-nav-container">
            <view
                :class="currentId === item.id ? 'on' : ''"
                v-for="(item, index) in navList"
                :key="item.id"
                v-show="index < 3 || visibleNav"
                @tap="navHandle(item)"
            >
                {{ item.name }}
            </view>

            <view class="more" @tap="moreHandle">更多</view>
        </view>

        <block v-for="(value, key) in commodityList" :key="key">
            <view class="commodity-list-container" :style="{ 'margin-top': listTop }" v-if="currentId === key">
                <view
                    class="commodity-item-container"
                    :class="index % 2 === 0 ? 'commodity-margin' : ''"
                    v-for="(item, index) in value.list"
                    :key="item.id"
                    @tap="toDetail(item)"
                >
                    <view class="commodity-img">
                        <image :src="item.defaultImage || '/static/gongzhuang_fuzhi.png'" mode="aspectFit"></image>
                    </view>
                    <view>{{ item.title }}</view>
                    <view>编码：{{ item.identifier }}</view>
                </view>
            </view>
        </block>
    </view>
    <view v-else class="no-commodity">
        <image src="/static/no-commodity.png" mode=""></image>
        <view>产品即将上架，尽请期待</view>
    </view>
</template>

<script>
import { getCommodityList } from '@/api/commodity.js';
export default {
    data() {
        return {
            visibleNav: false,
            navList: [],
            currentId: '',
            commodityList: {}
        };
    },
    computed: {
        listTop() {
            return uni.upx2px(88 + (this.visibleNav ? Math.ceil(this.navList.length / 3 - 1) * 88 : 0)) + 'px';
        }
    },
    methods: {
        moreHandle() {
            if (this.navList.length <= 3) return;
            this.visibleNav = !this.visibleNav;
        },
        navHandle(val) {
            if (!val) return;
            this.currentId = val.id;
            if (this.commodityList[val.id]) return;
            this.getCommodityList(val.id, 1, 10);
        },
        async getCommodityList(id, pageNum, pageSize) {
            uni.showLoading({
                title:'加载中'
            })
            let commodityList = await getCommodityList({
                commodityClassificationId: id,
                pageNum,
                pageSize,
                paging: true
            }).catch(() => {});
            uni.hideLoading()
            if (!commodityList) return;
            let obj = {
                pageNum,
                pageSize,
                list: this.commodityList[id] ? this.commodityList[id].list.concat(commodityList) : commodityList || []
            };
            this.$set(this.commodityList, id, obj);
        },
        toDetail(val) {
            uni.navigateTo({
                url: '../commodityDetail/commodityDetail?commodityId=' + val.id
            });
        }
    },
    onLoad(options) {
        let params = JSON.parse(options.category);
        uni.setNavigationBarTitle({
            title: params.name
        });
        this.navList = params.commodityClassificationList || [];
        this.navHandle(this.navList[0]);
    },
    onReachBottom() {
        if (this.commodityList[this.currentId].list.length % 10 !== 0) return;
        let num = this.commodityList[this.currentId].pageNum;
        num++;
        this.$set(this.commodityList[this.currentId], 'pageNum', num);
        this.getCommodityList(this.currentId, num, 10);
    }
};
</script>

<style lang="scss">
.commodity-nav-container {
    width: 100vw;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
    background-color: #fff;
    font-size: 28upx;
    color: #aeaeae;
    padding-bottom: 8upx;
    view {
        position: relative;
        width: 212upx;
        line-height: 74upx;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .on {
        color: #333;
        &::before {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
            width: 24upx;
            height: 4upx;
            background-color: #6dabff;
            border-radius: 1px;
        }
    }

    .more {
        position: absolute;
        right: 48upx;
        top: 0;
        padding: 0;
        width: auto;
    }
}

.commodity-list-container {
    // column-count: 2;
    // column-gap: 20upx;
    // column-rule: 20upx;
    padding: 0 28upx;
    display: flex;
    flex-wrap: wrap;
}
.commodity-item-container {
    // break-inside: avoid;
    width: 336upx;
    border-radius: 20upx;
    box-shadow: 4upx 4upx 28upx 0 #eeeeee;
    margin-bottom: 32upx;
    overflow: hidden;
    view {
        padding-left: 20upx;
    }
    .commodity-img {
        height: 336upx;
        position: relative;
        image {
            max-width: 100%;
            max-height: 100%;
            display: block;
            position: absolute;
            left: 50%;
            top: 0;
            transform: translate(-50%, 0);
        }
    }
    view:nth-child(2) {
        font-size: 28upx;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 6upx 20upx 10upx 20upx;
    }
    view:last-child {
        font-size: 24upx;
        color: #9b9b9b;
        padding-bottom: 20upx;
    }
}
.commodity-margin {
    margin-right: 22upx;
}

.no-commodity {
    image {
        width: 680upx;
        height: 480upx;
        display: block;
        margin: 200upx auto 60upx auto;
    }
    font-size: 28upx;
    color: #9b9b9b;
    text-align: center;
}
</style>
