<template>
    <view>
        <view class="search-container">
            <view class="search-input-container">
                <image src="/static/sousuo-2.png" mode=""></image>
                <input
                    type="text"
                    value=""
                    placeholder="商品名称/编号"
                    confirm-type="search"
                    focus
                    @confirm="getCommodityList"
                />
            </view>
        </view>
        <view class="commodity-list-container" v-if="commodityList.length">
            <view
                class="commodity-item-container"
                :class="index % 2 === 0 ? 'commodity-margin' : ''"
                v-for="(item, index) in commodityList"
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
    </view>
</template>

<script>
import { getCommodityList } from '@/api/commodity.js';
export default {
    data() {
        return {
            commodityList: []
        };
    },
    methods: {
        async getCommodityList(e) {
            uni.showLoading({
                title:'加载中'
            })
            let commodityList = await getCommodityList({ keyword: e.detail.value }).catch(() => {});
            uni.hideLoading()
            if (!commodityList) return;
            this.commodityList = commodityList;
        },
        toDetail(val) {
            uni.navigateTo({
                url: '../commodityDetail/commodityDetail?commodityId=' + val.id
            });
        }
    },
    onLoad() {}
    // onReachBottom() {
    //     if (this.commodityList[this.currentId].list.length % 10 !== 0) return;
    //     let num = this.commodityList[this.currentId].pageNum;
    //     num++;
    //     this.$set(this.commodityList[this.currentId], 'pageNum', num);
    //     this.getCommodityList(this.currentId, num, 10);
    // }
};
</script>

<style lang="scss">
page {
    padding-top: 132upx;
}
.search-container {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
    width: 100vw;
    background-color: #fff;
    padding: 28upx 30upx;
    box-sizing: border-box;
    box-shadow: 0 4upx 8upx 0 rgba(0, 0, 0, 0.07);
    .search-input-container {
        display: flex;
        height: 72upx;
        line-height: 72upx;
        border: 1px solid #9b9b9b;
        border-radius: 8upx;
        align-items: center;
        image {
            width: 32upx;
            height: 32upx;
            margin: 0 50upx;
        }
        input {
            font-size: 24upx;
            color: #9b9b9b;
        }
    }
}

.commodity-list-container {
    padding: 20upx 28upx 0 28upx;
    display: flex;
    flex-wrap: wrap;
}
.commodity-item-container {
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
        padding-bottom: 20upx;
        box-sizing: border-box;
        position: relative;
        padding: 0;
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
</style>
