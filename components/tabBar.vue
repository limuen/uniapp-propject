<template>
    <view
        class="tabbar_box"
        :class="isIphoneX ? 'iphoneX-height' : ''"
        :style="{ 'background-color': currentTabBar.backgroundColor }"
    >
        <block v-for="item in currentTabBar.list" :key="item.pagePath">
            <navigator
                v-if="item.isSpecial"
                class="tabbar_nav"
                hover-class="none"
                :url="item.pagePath"
                :style="{ color: item.selected ? currentTabBar.selectedColor : currentTabBar.color }"
                open-type="navigate"
            >
                <view class="special-wrapper"><image class="tabbar_icon" :src="item.iconPath"></image></view>
                <view class="special-red-dot" v-if="cartsNum">{{ cartsNum }}</view>
            </navigator>
            <navigator
                v-else
                class="tabbar_nav"
                hover-class="none"
                :url="item.pagePath"
                :style="{ color: item.selected ? currentTabBar.selectedColor : currentTabBar.color }"
                open-type="switchTab"
            >
                <image class="tabbar_icon" :src="item.selected ? item.selectedIconPath : item.iconPath"></image>
                <text>{{ item.text }}</text>
            </navigator>
        </block>
        <image src="/static/tabbar@2x.png" mode=""></image>
    </view>
</template>

<script>
export default {
    props: {
        tabbar: {
            type: Object,
            default() {
                return {};
            }
        },
        cartsNum:{
            type:Number,
            default:0
        }
    },
    data() {
        return {};
    },
    computed: {
        isIphoneX() {
            let bool;
            wx.getSystemInfo({
                success: res => {
                    bool = res.model == 'iPhone X' ? true : false;
                }
            });
            return bool;
        },
        currentTabBar() {
            let currentPages = getCurrentPages();
			console.log(currentPages,'getCurrentPages')
            let _this = currentPages[currentPages.length - 1];
            let pagePath = _this.route,
                tabbar = JSON.parse(JSON.stringify(this.tabbar));
            pagePath.indexOf('/') != 0 && (pagePath = '/' + pagePath);
			console.log(tabbar,'tabbar')
            tabbar.list.forEach(item => {
                item.selected = false;
                item.pagePath == pagePath && (item.selected = true);
            });
            return tabbar;
        }
    }
};
</script>

<style lang="scss">
.tabbar_box {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999;
    width: 100%;
    height: 98upx;
    & > image {
        position: absolute;
        left: 0;
        top: -38upx;
        width: 100vw;
        height: 136upx;
        z-index: -1;
    }
}
.tabbar_box.iphoneX-height {
    padding-bottom: 66upx;
}
.middle-wrapper {
    position: absolute;
    right: 310upx;
    bottom: 0;
    background-color: #fff;
    width: 120upx;
    height: 120upx;
    border-radius: 50%;
    border-top: 2upx solid #f2f2f3;
}
.middle-wrapper.iphoneX-height {
    bottom: 66upx;
}
.tabbar_nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 20upx;
    height: 100%;
    position: relative;
}
.tabbar_icon {
    width: 56upx;
    height: 56upx;
}
.special-wrapper {
    position: absolute;
    left: 50%;
    top: -32upx;
    width: 120upx;
    height: 120upx;
    transform: translateX(-50%);
    text-align: center;
    box-sizing: border-box;
    padding: 6upx;
}
.special-wrapper .tabbar_icon {
    width: 116upx;
    height: 116upx;
}
.special-red-dot {
    position: absolute;
    right: 24upx;
    top: -10upx;
    width: 28upx;
    height: 28upx;
    background-color: #ff4005;
    color: #fff;
    border-radius: 50%;
    text-align: center;
    line-height: 28upx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
