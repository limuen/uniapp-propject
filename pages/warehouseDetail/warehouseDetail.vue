<template>
    <view class="warehouse-detail-container" v-if="details.commodityCount">
        <view class="total-inventory-container">
            <image :src="options.commodityImg ? options.commodityImg : '/static/Headportrait.png'" mode=""></image>
            <view class="total-inventory-text">
                <view>{{ options.commodityName }}</view>
                <view>材质:{{ options.mainMaterialContent }}</view>
                <view>编号:{{ options.identifier }}</view>
            </view>
        </view>

        <view class="warehouse-list-container">
            <view
                class="warehouse-item-container"
                :class="index === currentIndex ? 'warehouse-selected' : ''"
                v-for="(item, index) in details.commodityInventoryStorehouseList"
                :key="item.id"
                v-show="index < 3 || visibleWarehouse"
                @tap="warehouseToggle(index)"
            >
                <view>{{ item.commodityCount }}</view>
                <view>{{ item.warehouseName }}</view>
            </view>
            <view class="more" @tap="showHandle">
                <view>更多</view>
                <image
                    src="/static/right-arrow.png"
                    mode=""
                    :class="visibleWarehouse ? 'more-arrow-down' : 'more-arrow-right'"
                ></image>
            </view>
        </view>

        <view class="specification-container">
            <view class="specification-color-continer">
                <view>颜色</view>
                <view
                    v-for="colorItem in details.commodityInventoryStorehouseList[currentIndex]
                        .commodityInventoryColorList"
                    :key="colorItem.commodityColourId"
                >
                    <view>
                        <text>{{ colorItem.colourName }}</text>
                    </view>
                </view>
            </view>
            <scroll-view scroll-x class="scroll-view-container" :style="{ height: scrollHeight }">
                <view class="specification-title" :style="{ width: halfWidth }">
                    <view
                        v-for="item in details.commodityInventoryStorehouseList[currentIndex]
                            .commodityInventoryColorList[0].commodityInventoryList"
                        :key="item.id"
                    >
                        {{ item.size }}
                    </view>
                </view>
                <view
                    class="specification-item"
                    :style="{ width: halfWidth }"
                    v-for="(colorItem, colorIndex) in details.commodityInventoryStorehouseList[currentIndex]
                        .commodityInventoryColorList"
                    :key="colorItem.commodityColourId"
                >
                    <view v-for="(val, sizeIndex) in colorItem.commodityInventoryList" :key="val.id">
                        <text
                            :class="val.selected ? 'specification-on' : ''"
                            @tap="sizeHandle(colorIndex, sizeIndex, val.quantity)"
                        >
                            {{ val.quantity > 0 ? val.quantity : 0 }}
                        </text>
                    </view>
                </view>
            </scroll-view>
        </view>

        <view class="btn-container"><view class="btn" @tap="addCart">加入购物车</view></view>
    </view>
</template>

<script>
import { getWarehouseDetails } from '@/api/commodity.js';
import { addShopping, getShopping } from '@/api/shoppingCart.js';
export default {
    data() {
        return {
            visibleWarehouse: false,
            arr: [1, 2, 3, 4, 5, 6],
            details: {},
            currentIndex: 0,
            options: {}
        };
    },
    computed: {
        halfWidth() {
            let num =
                this.details.commodityInventoryStorehouseList &&
                this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList &&
                this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList.length
                    ? this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList[0]
                          .commodityInventoryList.length
                    : 1;
            return uni.upx2px(140 * num) + 'px';
        },
        scrollHeight() {
            let num =
                this.details.commodityInventoryStorehouseList &&
                this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList
                    ? this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList
                          .length + 1
                    : 1;
            return uni.upx2px(num * 112 + 120) + 'px';
        }
    },
    methods: {
        showHandle() {
            if (this.details.commodityInventoryStorehouseList.length <= 3) return;
            this.visibleWarehouse = !this.visibleWarehouse;
        },
        // 获取仓库信息
        async getDetails(id) {
            uni.showLoading({
                title: '加载中'
            });
            let res = await getWarehouseDetails(id).catch(() => {});
            uni.hideLoading();
            if (!res) return;
            res.commodityInventoryStorehouseList.forEach((item, index) => {
                item.commodityInventoryColorList.forEach((val, idx) => {
                    val.selected = false;
                    val.commodityInventoryList.forEach((sizeItem, sizeIndex) => {
                        sizeItem.selected = false;
                    });
                });
            });
            this.details = res;
        },
        warehouseToggle(index) {
            this.currentIndex = index;
        },
        sizeHandle(colorIndex, sizeIndex, quantity) {
            if (!quantity) {
                uni.showToast({
                    title: '不可选择库存为零的商品',
                    icon: 'none'
                });
                return;
            }
            let sizeBool = this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList[
                colorIndex
            ].commodityInventoryList[sizeIndex].selected;
            this.$set(
                this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList[colorIndex]
                    .commodityInventoryList[sizeIndex],
                'selected',
                !sizeBool
            );
        },
        // 添加购物车
        async addCart() {
            let list = [];
            if (this.details.commodityInventoryStorehouseList[this.currentIndex].warehouseName === '总仓库') {
                this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList.forEach(
                    (item, colourIndex) => {
                        item.commodityInventoryList.forEach((val, sizeIndex) => {
                            if (val.selected) {
                                list.push({
                                    sizeIndex,
                                    colourIndex
                                });
                            }
                        });
                    }
                );
                if (!list.length) {
                    uni.showToast({
                        title: '请先选择商品规格',
                        icon: 'none'
                    });
                    return;
                }

                this.details.commodityInventoryStorehouseList.forEach((warehouse, warehouseIndex) => {
                    if (warehouseIndex === this.currentIndex) return;
                    list.forEach(item => {
                        let commodity =
                            warehouse.commodityInventoryColorList[item.colourIndex].commodityInventoryList[
                                item.sizeIndex
                            ];
                        if (commodity.quantity !== 0 && !item.commodityInventoryId) {
                            item.commodityId = commodity.commodityId;
                            item.commodityInventoryId = commodity.id;
                            item.selectQuantity = 1;
                        }
                    });
                });
            } else {
                this.details.commodityInventoryStorehouseList[this.currentIndex].commodityInventoryColorList.forEach(
                    item => {
                        item.commodityInventoryList.forEach(val => {
                            if (val.selected && val.quantity > 0) {
                                list.push({
                                    commodityId: val.commodityId,
                                    commodityInventoryId: val.id,
                                    selectQuantity: 1
                                });
                            }
                        });
                    }
                );
            }

            if (!list.length) {
                uni.showToast({
                    title: '请先选择商品规格',
                    icon: 'none'
                });
                return;
            }
			
            addShopping(list)
				
                .then(res => {
					console.log(list,'传参数的List')
                    getShopping()
                        .then(response => {
							console.log(response,'后台返回的参数')
                            let quantity = 0;
                            response.forEach(item => {
                                quantity += item.shoppingCartList.length;
                            });
                            uni.setStorageSync('cartsNum', quantity);
                        })
                        .catch(() => {});

                    uni.showToast({
                        title: '加入购物车成功',
                        icon: 'none'
                    });
                })
                .catch(() => {});
        }
    },
    onLoad(options) {
        this.options = options;
        this.getDetails(options.id);
    }
};
</script>

<style lang="scss">
page {
    background-color: #eee;
}
.total-inventory-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 240upx;
    background-color: #fff;
    padding: 0 70upx;
    image {
        width: 160upx;
        height: 160upx;
        border-radius: 50%;
        overflow: hidden;
    }
}
.total-inventory-text {
    color: #333;
    font-size: 24upx;
    view:first-child {
        font-size: 36upx;
        width: 360upx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 20upx;
    }
    view:last-child {
        padding-top: 10upx;
    }
}

.warehouse-list-container {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    background-color: #fff;
    margin: 12upx 0;
    padding-bottom: 88upx;
    position: relative;
}
.warehouse-item-container {
    width: 180upx;
    height: 80upx;
    font-size: 28upx;
    color: #333;
    border-radius: 8upx;
    text-align: center;
    line-height: 1;
    margin: 32upx 0 0 52upx;
    padding-top: 8upx;
    box-sizing: border-box;
    view:last-child {
        padding-top: 4upx;
    }
}
.warehouse-selected {
    background-color: #ff4005;
    color: #fff;
}

.more {
    position: absolute;
    right: 30upx;
    bottom: 0upx;
    width: 690upx;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 24upx;
    color: #9b9b9b;
    border-top: 1px solid #eee;
    line-height: 56upx;
    image {
        width: 16upx;
        height: 28upx;
        margin-left: 12upx;
    }
    .more-arrow-down {
        transform: rotate(90deg);
        transition: 0.5s all ease;
    }
    .more-arrow-right {
        transform: rotate(0deg);
        transition: 0.5s all ease;
    }
}

.specification-container {
    background-color: #fff;
    display: flex;
}
.scroll-view-container {
    height: 500upx;
    flex: 1;
    overflow: hidden;
    & > view:last-child {
        margin-bottom: 40upx;
    }
}
.specification-title {
    display: flex;
    align-items: center;
    height: 120upx;
    min-width: 100vw;
    font-size: 28upx;
    color: #333;
    view {
        width: 140upx;
        text-align: center;
    }
}
.specification-item {
    @extend .specification-title;
    border-bottom: 1px solid #eee;
    height: 80upx;
}
.specification-on {
    padding: 8upx 12upx;
    background-color: rgba(109, 171, 255, 0.25);
}
.specification-color-continer {
    width: 140upx;
    view {
        font-size: 28upx;
        text-align: center;
        border-bottom: 1px solid #eee;
    }
    view:first-child {
        height: 120upx;
        line-height: 120upx;
        border: none;
    }
    view:last-child {
        height: 80upx;
        line-height: 80upx;
    }
}

.btn-container {
    width: 100vw;
    height: 200upx;
    background-color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    padding-top: 60upx;
    box-sizing: border-box;
}
.btn {
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
</style>
