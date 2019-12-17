<template>
    <view class="inStock-container">
        <block v-for="(value, key) in commodityList" :key="key">
            <view class="commodity-list-container" v-if="currentId === key">
                <view
                    class="commodity-container"
                    :class="index % 2 == 0 ? 'com-margin' : ''"
                    v-for="(item, index) in value.list"
                    :key="item.id"
                    @tap="detailsHandle(item)"
                >
                    <view class="commodity-img"><image :src="item.defaultImage" mode="aspectFit"></image></view>
                    <view class="commodity-name">{{ item.title }}</view>
                    <view class="commodity-numbering">编号 {{ item.identifier }}</view>
                </view>
            </view>
        </block>

        <view class="category-list-container" :class="hidden ? 't-right' : 't-left'">
            <view class="category-container" v-for="(item, index) in categoryList" :key="item.id">
                <view class="first-level" @tap="toggleShow(item, index)">
                    <view class="first-level-name" :class="item.selected ? 'selected' : ''">{{ item.name }}</view>
                    <image src="/static/right-arrow.png" :class="item.selected ? 'down' : ''" mode=""></image>
                </view>
                <view class="secondary" v-if="item.selected">
                    <view
                        class="secondary-text"
                        :class="val.id === currentId ? 'secondary-selected' : ''"
                        v-for="(val, idx) in item.commodityClassificationList"
                        :key="val.id"
                        @tap="secondaryToggle(val, idx)"
                    >
                        {{ val.name }}
                    </view>
                </view>
            </view>

            <view class="toggleAction">
                <image src="/static/right-arrow-box.png" v-if="hidden" mode="" @tap="toggleAction"></image>
                <image src="/static/left-arrow.png" v-else mode="" @tap="toggleAction"></image>
            </view>
        </view>
        <tarbar-nav :tabbar="tabBar" :cartsNum="cartsNum"></tarbar-nav>
    </view>
</template>

<script>
import { getCategoryList } from '@/api/index.js';
import { getCommodityList } from '@/api/commodity.js';
import TabBar from '@/components/tabBar.vue';
export default {
    data() {
        return {
            categoryList: [],
            commodityList: {},
            currentId: 0,
            hidden: true,
            tabBar: this.$tabBar,
            cartsNum: 0
        };
    },
    components: {
        tarbarNav: TabBar
    },
    methods: {
        toggleShow(val, index) {
            if (val.selected) {
                this.$set(this.categoryList[index], 'selected', false);
            } else {
                this.categoryList.forEach(item => {
                    item.selected = false;
                });
                this.$set(this.categoryList[index], 'selected', true);
            }
            this.currentId = this.categoryList[index].commodityClassificationList[0].id;
            if (this.commodityList[this.currentId]) return;
            this.getCommodityList(this.currentId, 1, 10);
        },
        toggleAction() {
            this.hidden = !this.hidden;
        },
        secondaryToggle(val, index) {
            this.currentId = val.id;
            if (this.commodityList[this.currentId]) return;
            this.getCommodityList(val.id, 1, 10);
        },
        async getCategoryList() {
            let res = await getCategoryList().catch(() => {});
            if (!res || !res.length) return;
            let categoryList = res.filter((item, index) => {
                if (item.commodityClassificationList) {
                    item.selected = false;
                }
                return item.commodityClassificationList;
            });
            categoryList[0].selected = true;
            this.categoryList = categoryList;
            this.currentId = this.categoryList[0].commodityClassificationList[0].id;
            this.getCommodityList(this.categoryList[0].commodityClassificationList[0].id, 1, 10);
        },
        async getCommodityList(id, pageNum, pageSize) {
            uni.showLoading({
                title: '加载中'
            });
            let commodityList = await getCommodityList({
                commodityClassificationId: id,
                pageNum,
                pageSize,
                paging: true
            }).catch(() => {});
            uni.hideLoading();
            if (!commodityList) return;
            let obj = {
                pageNum,
                pageSize,
                list: this.commodityList[id] ? this.commodityList[id].list.concat(commodityList) : commodityList || []
            };
            this.$set(this.commodityList, id, obj);
        },
        detailsHandle(val) {
            uni.navigateTo({
                url:
                    '../warehouseDetail/warehouseDetail?id=' +
                    val.id +
                    '&commodityImg=' +
                    val.defaultImage +
                    '&identifier=' +
                    val.identifier +
                    '&commodityName=' +
                    val.title +
                    '&mainMaterialContent=' +
                    val.mainMaterialContent
            });
        }
    },
    onLoad() {
        this.getCategoryList();
    },
    onShow() {
        this.cartsNum = uni.getStorageSync('cartsNum');
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
page {
    padding-top: 50upx;
    padding-bottom: 200upx;
    box-sizing: border-box;
}
.inStock-container {
    .commodity-list-container {
        padding: 0 28upx;
        display: flex;
        flex-wrap: wrap;
    }
    .commodity-container {
        width: 336upx;
        background: #ffffff;
        margin-bottom: 14upx;
        border-radius: 20upx;
        box-shadow: 4upx 4upx 28upx 0 #eeeeee;
        overflow: hidden;
        .commodity-img {
            height: 336upx;
            position: relative;
            overflow: hidden;
        }
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
    .commodity-name {
        font-size: 28upx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 6upx 20upx 10upx 20upx;
    }
    .commodity-numbering {
        font-size: 24upx;
        color: #9b9b9b;
        line-height: 64upx;
        padding-left: 20upx;
    }
    .com-margin {
        margin-right: 22upx;
    }

    .category-list-container {
        width: 280upx;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        background-color: #fff;
        box-shadow: 16upx 0px 10upx -10upx #ddd;
        padding-top: 50upx;
        box-sizing: border-box;
        transition: 0.5s all ease;
    }
    .category-container {
        margin-top: 60upx;
    }
    .first-level {
        height: 40upx;
        display: flex;
        align-items: center;
        font-size: 28upx;
        color: #a6a5a5;
        padding: 0 44upx;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        view {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        image {
            width: 20upx;
            height: 28upx;
            margin-left: 20upx;
            transition: 0.5s all ease;
        }
    }
    .secondary {
        font-size: 24upx;
        padding-left: 80upx;
    }
    .secondary-text {
        font-size: 24upx;
        padding-top: 36upx;
    }
    .selected {
        color: #272636;
    }
    .toggleAction {
        position: absolute;
        top: 436upx;
        right: 0;
        width: 56upx;
        height: 148upx;
        transform: translateX(100%);
        image {
            width: 56upx;
            height: 148upx;
        }
    }

    .t-right {
        transform: translateX(-100%);
    }
    .t-left {
        transform: translateX(0);
    }

    .secondary-selected {
        color: #6dabff;
    }

    .down {
        transform: rotate(90deg);
    }
}
</style>
