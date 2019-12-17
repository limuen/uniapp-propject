<template>
	<view>
		<view class="footer-container">
			<image src="/static/icon01.png" mode=""></image>
			<view class="footer-text">
				<view>每一件小事，我们都用心去做</view>
				<view>We do every little thing attentively</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="scss">
	.footer-container{
		position: fixed;
		left: 0;
		bottom: 48upx;
		width: 100vw;
		color: #A6C9F8;
		display: flex;
		justify-content: center;
		align-items: center;
		image{
			width: 64upx;
			height: 64upx;
			margin-right: 10upx;
		}
		.footer-text{
			view:first-child{
				font-size: 24upx
			}
			view:last-child{
				font-size: 20upx;
			}
		}
	}
</style>
