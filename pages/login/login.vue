<template>
    <view class="login-container">
        <image src="/static/logo.png" mode=""></image>
        <view class="input-container">
            <input
                type="number"
                v-model="loginForm.loginAccount"
                :maxlength="11"
                placeholder="请输入手机号码"
                placeholder-class="plac"
            />
            <view class="password-container">
                <input
                    type="text"
                    v-model="loginForm.password"
                    :password="ispassword"
                    placeholder="请输入密码"
                    placeholder-class="plac placeholder-psw"
                />
                <view class="toggle-password" @tap.stop="togglePsd">
                    <image src="/static/closeEyes@2x.png" v-if="ispassword" mode="" class="icon-hidden"></image>
                    <image src="/static/eyes@2x.png" mode="" v-else class="icon-show"></image>
                </view>
            </view>
            <button type="primary" open-type="getUserInfo" @tap="loginHandle">登录</button>
            <navigator hover-class="none" url="/pages/registered/registered" open-type="navigate">短信验证码注册</navigator>
        </view>

        <footerView></footerView>
    </view>
</template>

<script>
import footer from '@/components/footer.vue';
import { login, wxLogin } from '@/api/login.js';
import { getShopping } from '@/api/shoppingCart.js';
import md5 from '@/common/MD5/md5.min.js';
export default {
    data() {
        return {
            ispassword: true,
            loginForm: {
                loginAccount: '',
                password: ''
            }
        };
    },
    components: {
        footerView: footer
    },
    methods: {
        togglePsd() {
            this.ispassword = !this.ispassword;
        },
        loginHandle() {
            const regPsw = /^[\w]{6,20}$/,
                regPhone = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
            if (!regPhone.test(this.loginForm.loginAccount)) {
                uni.showToast({
                    title: '请输入正确的手机号',
                    icon: 'none'
                });
                return;
            }
            if (!regPsw.test(this.loginForm.password)) {
                uni.showToast({
                    title: '密码必须为6-20位的字母和数字组合',
                    icon: 'none'
                });
                return;
            }
            let obj = Object.assign({}, this.loginForm);
            obj.password = md5(obj.password);
            login(obj)
                .then(res => {
                    getShopping()
                        .then(response => {
                            response = response || []
                            let num = 0;
                            response.forEach(item => {
                                num += item.shoppingCartList.length;
                            });
                            uni.setStorageSync('cartsNum', num);
                            uni.setStorageSync('carts', response);

                            uni.switchTab({
                                url: '../index/index'
                            });
                        })
                        .catch(() => {});

                    uni.login({
                        provider: 'weixin',
                        success: res => {
                            wxLogin({ jsCode: res.code }).catch(() => {});
                        }
                    });
                })
                .catch(() => {});
        }
    }
};
</script>

<style lang="scss">
.login-container {
    > image {
        display: block;
        width: 375upx;
        height: 375upx;
        margin: 80upx auto 0 auto;
    }
    .input-container {
        padding: 50upx 124upx 0 124upx;
        input {
            width: 500upx;
            height: 96upx;
            line-height: 96upx;
            border: 1px solid #6dabff;
            border-radius: 8upx;
            padding: 0 20upx;
            box-sizing: border-box;
            font-size: 28upx;
        }
        .password-container {
            margin-top: 20upx;
            font-size: 28upx;
            display: flex;
            border: 1px solid #6dabff;
            border-radius: 8upx;
            box-sizing: border-box;
            .toggle-password {
                width: 100upx;
                height: 96upx;
                position: relative;
                right: 0;
                top: 0;
                z-index: 999;
            }
            input {
                flex: 1;
                border: none;
            }
            image {
                width: 40upx;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            .icon-show {
                height: 22upx;
            }
            .icon-hidden {
                height: 36upx;
            }
        }

        button {
            background-color: #6dabff;
            margin-top: 50upx;
            font-size: 28upx;
            height: 96upx;
            line-height: 96upx;
            border-radius: 8upx;
            letter-spacing: 20upx;
        }
        navigator {
            font-size: 24upx;
            color: #6dabff;
            text-align: right;
            line-height: 64upx;
        }
    }

    .plac {
        font-size: 28upx;
        color: #e2e2e2;
        text-align: center;
    }
    .placeholder-psw {
        text-indent: 3em;
    }
}
</style>
