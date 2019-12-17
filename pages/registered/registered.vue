<template>
    <view class="registered-container">
        <input type="number" v-model="registeredForm.loginAccount" placeholder="请输入手机号码" :maxlength="11"
            placeholder-class="placeholder" />
        <view class="msg-code">
            <input type="number" v-model="registeredForm.verificationCode" placeholder="请输入短信动态码" placeholder-class="placeholder" />
            <view class="msg-code-btn" :class="time !== 60 ? 'disbaled' : ''" @tap="getMsgCode">{{ msgCodeText }}</view>
        </view>
        <input type="text" v-model="registeredForm.password" placeholder="请输入密码" password="true" placeholder-class="placeholder" />
        <button type="primary" open-type="getUserInfo" class="btn" @tap="nestStep">下一步</button>

        <footerView></footerView>
    </view>
</template>

<script>
    import footer from '@/components/footer.vue';
    import {
        register,
        getVerificationCode,
        wxLogin
    } from '@/api/login.js';
    import md5 from '@/common/MD5/md5.min.js';
    export default {
        data() {
            return {
                isFirst: true,
                msgCodeText: '获取动态码',
                time: 60,
                timer: null,
                registeredForm: {
                    loginAccount: '',
                    password: '',
                    verificationCode: '',
                    source: '微信小程序'
                }
            };
        },
        components: {
            footerView: footer
        },
        methods: {
            getMsgCode() {
                if (!this.isFirst || this.time != 60) return
                const regPhone = /(^1[3456789][0-9]{9}$)|(^(\+?852\-?)?[569]\d{3}\-?\d{4}$)|(^(\+?886\-?|0)?9\d{8}$)|(^[6]([8|6])\d{5}$)/;
                if (!regPhone.test(this.registeredForm.loginAccount)) {
                    uni.showToast({
                        title: '请输入正确的手机号码',
                        icon: 'none'
                    });
                    return;
                }

                this.isFirst = false
                getVerificationCode(this.registeredForm.loginAccount)
                    .then(res => {
                        this.timer = setInterval(() => {
                            this.time--;
                            this.msgCodeText = this.time + 'S';
                            if (this.time === 0) {
                                clearInterval(this.timer);
                                this.time = 60;
                                this.isFirst = true
                                this.msgCodeText = '获取动态码';
                            }
                        }, 1000);
                    })
                    .catch(() => {});
            },
            nestStep() {
                const regPsw = /^[\w]{6,20}$/,
                    regPhone = /(^1[3456789][0-9]{9}$)|(^(\+?852\-?)?[569]\d{3}\-?\d{4}$)|(^(\+?886\-?|0)?9\d{8}$)|(^[6]([8|6])\d{5}$)/;
                if (!regPhone.test(this.registeredForm.loginAccount)) {
                    uni.showToast({
                        title: '请输入正确的手机号码',
                        icon: 'none'
                    });
                    return;
                }
                if (!this.registeredForm.verificationCode) {
                    uni.showToast({
                        title: '请输入正确的验证码',
                        icon: 'none'
                    });
                    return;
                }
                if (!regPsw.test(this.registeredForm.password)) {
                    uni.showToast({
                        title: '密码必须为6-20位的字母和数字组合',
                        icon: 'none'
                    });
                    return;
                }
                let obj = Object.assign({}, this.registeredForm);
                obj.password = md5(obj.password);
                register(obj)
                    .then(res => {
                        uni.login({
                            provider: 'weixin',
                            success: res => {
                                wxLogin({
                                    jsCode: res.code
                                }).catch(() => {});
                            }
                        });
                        uni.setStorageSync('cartsNum', 0);
                        uni.switchTab({
                            url: '../index/index'
                        });
                    })
                    .catch(() => {});
            }
        }
    };
</script>

<style lang="scss">
    page {
        padding: 120upx 32upx 0;
        box-sizing: border-box;
    }

    .registered-container {
        input {
            width: 686upx;
            height: 96upx;
            background-color: #eee;
            padding: 0 40upx;
            border-radius: 8upx;
            box-sizing: border-box;
            margin-top: 40upx;
            font-size: 28upx;
        }

        .placeholder {
            font-size: 28upx;
            color: #9b9b9b;
        }

        .msg-code {
            display: flex;
            margin-top: 40upx;
            border-radius: 8upx;
            overflow: hidden;

            input {
                flex: 1;
                margin: 0;
                border-radius: 0;
            }

            .msg-code-btn {
                width: 170upx;
                height: 96upx;
                line-height: 96upx;
                background-color: #4f90e8;
                font-size: 24upx;
                color: #fff;
                text-align: center;
            }

            .disbaled {
                background-color: #9b9b9b;
            }
        }

        .btn {
            margin-top: 104upx;
            background-color: #6dabff;
            font-size: 28upx;
            height: 100upx;
            line-height: 100upx;
            box-shadow: 0 4upx 20upx 0;
        }
    }
</style>
