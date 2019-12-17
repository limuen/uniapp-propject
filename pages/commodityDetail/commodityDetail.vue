<template>
    <view class="commodity-detail-container">
        <view class="commodity-img"><image :src="detail.defaultImage" mode="aspectFit"></image></view>

        <view class="commodity-specification-container">
            <view class="commodity-name">{{ detail.title }}</view>
            <view class="commodity-numbering">编码:{{ detail.identifier }}</view>
            <view class="color-container">
                <view class="color-title">颜色</view>
                <view class="color-item-container">
                    <view
                        :class="colorIndex === index ? 'on' : ''"
                        v-for="(item, index) in colorList"
                        :key="item.id"
                        @tap="colorHandle(item, index)"
                    >
                        {{ item.name }}
                    </view>
                </view>
            </view>

            <view class="warehouse-container">
                <view class="warehouse-title">仓库</view>
                <view class="warehouse-item-container">
                    <block v-for="(item, index) in warehouse[colorList[colorIndex].id]" :key="item.warehouseId">
                        <view
                            v-if="item.warehouseName !== '总仓库'"
                            :class="warehouseIndex === index ? 'on' : ''"
                            @tap="warehouseHandle(item, index)"
                        >
                            {{ item.warehouseName }}
                        </view>
                    </block>
                </view>
            </view>

            <view class="size-container">
                <view class="size-title">
                    <view>尺寸</view>
                    <view>价格</view>
                    <view>库存</view>
                    <view>数量</view>
                </view>
                <view
                    class="size-item-container"
                    v-for="(item, index) in warehouse[colorList[colorIndex].id][warehouseIndex].commodityInventoryList"
                    :key="item.id"
                >
                    <view>{{ item.size }}</view>
                    <view>{{ item.price || 0 }}</view>
                    <view>{{ item.quantity > 0 ? item.quantity : 0 }}</view>
                    <view>
                        <numberbox
                            :min="0"
                            :max="item.quantity"
                            :value="item.selectQuantity"
                            :disabled="item.selectQuantity > item.quantity || item.quantity === 0"
                            @change="quantityChange($event, index)"
                        ></numberbox>
                    </view>
                </view>
            </view>
        </view>

        <view class="detail-container"><rich-text :nodes="detail.details"></rich-text></view>

        <view class="action-container">
            <view @tap="toShoppingCart" class="cart-container">
                <image src="/static/shopping-cart-icon.png" mode=""></image>
                <view v-if="isCart"></view>
            </view>
            <view class="action-add-cart" @tap="addCart">加入购物车</view>
            <view class="action-buy" @tap="buyHandle">立即购买</view>
        </view>
    </view>
</template>

<script>
import numberbox from '../../components/number-box/number-box.vue';
import { getCommodityList, getCommodityColor, getWarehouse } from '@/api/commodity.js';
import { addShopping, getShopping } from '@/api/shoppingCart.js';
export default {
    data() {
        return {
            detail: {},
            warehouseIndex: 0,
            warehouseId: '',
            colorIndex: 0,
            commodityImg: '',
            colorList: [],
            warehouse: {},
            isCart: false
        };
    },
    components: {
        numberbox
    },
    methods: {
        warehouseHandle(item, index) {
            this.warehouseIndex = index;
            this.warehouseId = item.warehouseId;
        },
        async colorHandle(item, index) {
            await this.getWarehouse(item.id);
            this.detail.defaultImage = item.code;
            this.colorIndex = index;
            if (!this.warehouseIndex && this.warehouse[this.colorList[index].id] !== this.warehouseId) {
                this.warehouseIndex = 0;
            }
        },
        quantityChange(val, index) {
            this.$set(
                this.warehouse[this.colorList[this.colorIndex].id][this.warehouseIndex].commodityInventoryList[index],
                'selectQuantity',
                val
            );
        },
        // 添加购物车
        async addCart() {
            let list = [];
            this.warehouse[this.colorList[this.colorIndex].id][this.warehouseIndex].commodityInventoryList.forEach(
                val => {
                    if (val.selectQuantity !== 0) {
                        list.push({
                            commodityId: val.commodityId,
                            commodityInventoryId: val.id,
                            selectQuantity: val.selectQuantity
                        });
                    }
                }
            );
            if (list.length === 0) {
                uni.showToast({
                    title: '请先选择商品数量',
                    icon: 'none'
                });
                return;
            }
            addShopping(list)
                .then(res => {
                    getShopping()
                        .then(response => {
                            let quantity = 0;
                            response.forEach(item => {
                                quantity += item.shoppingCartList.length;
                            });
                            this.isCart = quantity > 0;
                            uni.setStorageSync('cartsNum', quantity);
                        })
                        .catch(() => {});

                    uni.showToast({
                        title: '加入购物车成功',
                        icon: 'none'
                    });
                })
                .catch(() => {});
        },
        //立即购买
        buyHandle() {
            let list = [];
            this.warehouse[this.colorList[this.colorIndex].id][this.warehouseIndex].commodityInventoryList.forEach(
                val => {
                    if (val.selectQuantity !== 0) {
                        list.push({
                            commodityId: val.commodityId,
                            commodityInventoryId: val.id,
                            selectQuantity: val.selectQuantity,
                            amount: val.price
                        });
                    }
                }
            );
            if (list.length === 0) {
                uni.showToast({
                    title: '请先选择商品数量',
                    icon: 'none'
                });
                return;
            }
            uni.navigateTo({
                url: '../confirmOrder/confirmOrder?list=' + JSON.stringify(list) + '&immediatePurchase=true'
            });
        },
        toShoppingCart() {
            uni.navigateTo({
                url: '../shoppingCart/shoppingCart'
            });
        },
        async getCommodityDetail(commodityId) {
            let detail = await getCommodityList({ commodityId }).catch(() => {});
            this.detail = detail[0];
        },
        async getCommodityColor(commodityId) {
            this.colorList = (await getCommodityColor(commodityId).catch(() => {})) || [];
            this.getWarehouse(this.colorList[0].id);
        },
        // 获取仓库列表
        async getWarehouse(commodityColourId) {
            uni.showLoading({
                title: '加载中'
            });
            let warehouse = await getWarehouse(this.commodityId, commodityColourId).catch(() => {});
            uni.hideLoading();
            if (!warehouse) return;
            warehouse.commodityInventoryWarehouseList.forEach(item => {
                item.commodityInventoryList.forEach(val => {
                    val.selectQuantity = 0;
                });
            });
            this.$set(this.warehouse, commodityColourId, warehouse.commodityInventoryWarehouseList);
        }
    },
    onLoad(options) {
        this.commodityId = options.commodityId;
        this.getCommodityDetail(options.commodityId);
        this.getCommodityColor(options.commodityId);
    },
    onShow() {
        this.isCart = uni.getStorageSync('cartsNum') > 0;
    }
};
</script>

<style lang="scss">
.commodity-detail-container {
    padding-bottom: 140upx;
}

.commodity-img {
    height: 360upx;
    position: relative;
    image {
        position: absolute;
        left: 50%;
        top: 0;
        transform: translate(-50%, 0);
        max-height: 100%;
    }
}
.commodity {
    &-specification-container {
        padding: 0 32upx;
        font-size: 24upx;
        color: #333;
    }
    &-name {
        font-size: 36upx;
        color: #333;
        padding-top: 40upx;
    }
    &-numbering {
        font-size: 24upx;
        color: #9b9b9b;
        line-height: 72upx;
        border-bottom: 1px solid #eeeeee;
    }
}

.color {
    &-title {
        line-height: 52upx;
    }
    &-item-container {
        display: flex;
        padding-top: 4px;
        border-bottom: 1px solid #eeeeee;
        flex-wrap: wrap;
        font-size: 20upx;
        view {
            background-color: #eee;
            padding: 12upx;
            border-radius: 8upx;
            margin-right: 40upx;
            margin: 0 40upx 24upx 0;
        }
        .on {
            background-color: #6dabff;
            color: #fff;
        }
    }
}

.warehouse {
    &-title {
        @extend .color-title;
    }
    &-item-container {
        @extend .color-item-container;
    }
}

.size {
    &-container {
        font-size: 24upx;
        color: #333;
        padding-top: 8upx;
    }
    &-title,
    &-item-container {
        display: flex;
        padding: 10upx 0;
        & > view {
            line-height: 48upx;
            width: 28%;
            text-align: center;
        }
        & > view:first-child {
            width: 16%;
        }
    }
}
.no-size {
    height: 400upx;
}

.action {
    &-container {
        font-size: 28upx;
        color: #fff;
        display: flex;
        align-items: center;
        width: 100vw;
        position: fixed;
        left: 0;
        bottom: 0;
        background-color: #fff;
        z-index: 999;
        box-shadow: 0 -4upx 20upx 0 rgba(0, 0, 0, 0.1);
        view {
            width: 312upx;
            height: 104upx;
            line-height: 104upx;
            text-align: center;
            box-shadow: 0 4upx 20upx 0 rgba(0, 0, 0, 0.1);
        }
        view:first-child {
            flex: 1;
            position: relative;
            image {
                width: 60upx;
                height: 56upx;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            view {
                width: 18upx;
                height: 18upx;
                background-color: #ff4005;
                border-radius: 50%;
                position: absolute;
                left: 66%;
                top: 18%;
            }
        }
    }

    &-add-cart {
        background-color: #6dabff;
    }
    &-buy {
        background-color: #ff4005;
    }
}

.commodity-detail-img {
    width: 688upx;
    height: auto;
    display: block;
    margin: 60upx auto 160upx auto;
}

.detail-container {
    padding: 0 40upx;
}
rich-text {
    font-size: 24upx;
    text-align: center;
    padding: 0 28upx;
    margin: 0 auto;
    img {
        max-width: 80vw;
        height: auto;
    }
}
</style>
