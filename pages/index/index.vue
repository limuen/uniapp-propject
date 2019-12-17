<template>
    <view class="container">
		<view class="address">
			address
		</view>
        <view class="swiper-container">
            <swiper
                :indicator-dots="true"
                indicator-active-color="#6DABFF"
                indicator-color="rgba(238,238,238, .8)"
                :autoplay="true"
                :interval="3000"
                :duration="1000"
                circular="true"
            >
                <swiper-item v-for="item in 3" :key="item">
                    <view class="swiper-item">
                        <image :src="'/static/banner' + (item + 1) + '.png'" mode=""></image>
                    </view>
                </swiper-item>
            </swiper>
        </view>

        <view class="announcement-container">
            <image src="/static/dinghuogonggao.png" mode=""></image>
            <view class="announcement-swiper-container">
                <swiper :autoplay="true" :interval="3000" :duration="1000" circular="true" vertical="true">
                    <swiper-item v-for="item in 1" :key="item">
                        <view class="announcement-swiper-item" @tap="toNotice">ArriveGuide全新升级啦！</view>
                    </swiper-item>
                </swiper>
            </view>
        </view>

        <view class="search-container" id="the-id">
            <view class="search-input-container">
                <image src="/static/sousuo-2.png" mode=""></image>
                <input type="text" value="" placeholder="商品名称/编号" @focus="focusHandle" />
            </view>
            <!-- <view class="hot-search">
				<text>卫衣</text>
				<text>卫衣</text>
				<text>卫衣</text>
			</view> -->
        </view>

        <view class="category-container">
            <view class="first-category" v-if="categoryList[0].name" @tap="toCategory(categoryList[0])">
                <text>{{ categoryList[0].name }}</text>
                <image :src="categoryList[0].icoUrl" mode="aspectFit"></image>
            </view>
            <view class="second-category" v-if="categoryList[1].name" @tap="toCategory(categoryList[1])">
                <image :src="categoryList[1].icoUrl" mode="aspectFit"></image>
                <text>{{ categoryList[1].name }}</text>
            </view>

            <view class="other-category-container">
                <block v-for="(item, index) in categoryList" :key="item.id">
                    <view
                        class="other-category"
                        v-if="index > 1"
                        @tap="toCategory(item)"
                    >
                        <text>{{ item.name }}</text>
                        <image :src="item.icoUrl" mode="aspectFit"></image>
                    </view>
                </block>
            </view>
        </view>

        <tarbar-nav :tabbar="tabBar" :cartsNum="cartsNum"></tarbar-nav>
    </view>
</template>

<script>
import { getCategoryList } from '@/api/index.js';
import { login, wxLogin } from '@/api/login.js';
import TabBar from '@/components/tabBar.vue';
export default {
    data() {
        return {
            categoryList: [],
            tabBar: this.$tabBar,
            cartsNum: 0
        };
    },
    components: {
        tarbarNav: TabBar
    },
    methods: {
        async getCategoryList() {
            let res = await getCategoryList().catch(() => {});
            if (!res) return;
            this.categoryList = res;
        },
        toCategory(val) {
            uni.navigateTo({
                url: '../commodityList/commodityList?category=' + JSON.stringify(val)
            });
        },
        focusHandle() {
            uni.navigateTo({
                url: '../commoditySearch/commoditySearch'
            });
        },
        toNotice(){
            uni.navigateTo({
                url:'../notice/notice'
            })
        }
    },
    onLoad() {
        this.getCategoryList();
    },
    onShow() {
        this.cartsNum = uni.getStorageSync('cartsNum');
    },
    onReady() {
        uni.hideTabBar({});
    },
    onPullDownRefresh() {
        this.getCategoryList();
        uni.stopPullDownRefresh();
    }
};
</script>

<style lang="scss">
page {
    background-color: $uni-bg-color-grey;
    padding-bottom: 200upx;
}
.container {
	position: relative;
	.address{
		position: fixed;
		left: 0;
		top: 0;
		color: #000;
		font-size: 30px;
		z-index: 99999;
	}
    .swiper-container {
        height: 324upx;
        swiper {
            overflow: hidden;
            width: 100%;
            height: 100%;
            .swiper-item {
                width: 100%;
                height: 100%;
                image {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    .announcement-container {
        height: 80upx;
        background-color: #fff;
        display: flex;
        align-items: center;
        image {
            width: 124upx;
            height: 36upx;
            margin: 0 80upx;
        }
        .announcement-swiper-container {
            height: 80upx;
            swiper {
                width: 300upx;
                height: 100%;
                font-size: 24upx;
                .announcement-swiper-item {
                    line-height: 80upx;
                }
            }
        }
    }

    .search-container {
        background-color: #fff;
        padding: 20upx 30upx;
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

        .hot-search {
            display: flex;
            height: 64upx;
            align-items: center;
            font-size: 20upx;
            color: #9b9b9b;
            text {
                padding-left: 40upx;
            }
        }
    }

    .category-container {
        padding: 0 30upx;
        box-sizing: border-box;
        > view,
        .other-category-container > view {
            background-color: #fff;
            margin-top: 20upx;
            display: flex;
            align-items: center;
            font-size: 32upx;
            color: #484747;
            border-radius: 12upx;
            height: 208upx;
            image {
                max-height: 180upx;
                max-width: 180upx;
            }
        }
        .first-category,
        .second-category {
            width: 690upx;
            padding: 0 100upx 0 120upx;
            box-sizing: border-box;
            justify-content: space-between;
        }
        .first-category {
            padding-left: 120upx;
        }
        .second-category {
            padding-right: 120upx;
        }

        .other-category-container {
            flex-wrap: wrap;
            height: auto;
            background-color: transparent;

            .other-category {
                width: 334upx;
                padding: 0 20upx 0 40upx;
                box-sizing: border-box;
                justify-content: space-between;
                font-size: 24upx;
                text {
                    width: 92upx;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
                image {
                    max-width: 160upx;
                    max-height: 160upx;
                }
            }
            &>view:nth-child(odd){
                margin-right: 22upx;
            }
        }
    }
}
</style>
