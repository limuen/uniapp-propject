<template>
    <view class="add-address-container">
        <view class="textarea-container">
            <textarea
                value=""
                placeholder="粘贴文本，请以逗号或者空格号分隔收件人信息"
                placeholder-class="place"
                @input="testAddress"
            />
        </view>

        <view class="address-detail-container">
            <view class="phone">
                <input
                    type="text"
                    :value="detail.name"
                    placeholder="收件人姓名"
                    @input="nameChange"
                    placeholder-class="place"
                />
                <input
                    type="number"
                    :value="detail.phone"
                    placeholder="电话"
                    :maxlength="11"
                    @input="phoneChange"
                    placeholder-class="place"
                />
            </view>
            <textarea :value="detail.address" @input="addressChange" placeholder="省市区" placeholder-class="place" />
            <view class="set-default-container">
                <checkbox-group @change="checkChange">
                    <label>
                        <checkbox
                            value="default"
                            :checked="detail.defaultEnable == 1"
                            color="#6DABFF"
                            style="transform: scale(.6);"
                        />
                        设为默认地址
                    </label>
                </checkbox-group>
            </view>
        </view>

        <view class="btn-container"><view class="btn" @tap="confirm">保存地址</view></view>
    </view>
</template>

<script>
import { addAddress, updateAddress } from '@/api/address.js';
import http from '../../utils/request.js';
import md5 from '@/common/MD5/md5.min.js';
export default {
    data() {
        return {
            detail: {
                defaultEnable: 0
            },
            status: 'add',
            addressStr: '',
            isFirst: true
        };
    },
    methods: {
        testAddress(e) {
            let reg = /[\n\s+,，；;]/g,
                nameReg = /^[\u4E00-\u9FA5]{2,32}(·[\u4E00-\u9FA5]+)*$/,
                phoneReg = /^\d{7,}$/;

            let arr = e.detail.value.replace(reg, ',').split(','),
                name,
                phone,
                address;
            
            for (let i = 0; i < arr.length; i++) {
                if (nameReg.test(arr[i])) {
                    name = arr[i];
                    continue;
                }
                if (phoneReg.test(arr[i])) {
                    phone = arr[i];
                    continue;
                }
                if(arr[i].length > 6){
                    address = arr[i];
                }
            }
            this.detail = {
                name: name,
                phone: phone,
                address: address,
                defaultEnable: this.detail.defaultEnable,
                id: this.detail.id
            };
            
            this.addressStr = e.detail.value;
        },
        nameChange(e) {
            this.$set(this.detail, 'name', e.detail.value);
        },
        phoneChange(e) {
            this.$set(this.detail, 'phone', e.detail.value);
        },
        addressChange(e) {
            this.$set(this.detail, 'address', e.detail.value);
        },
        checkChange(e) {
            let value = e.detail.value[0];
            let num = value ? 1 : 0;
            this.$set(this.detail, 'defaultEnable', num);
        },
        async confirm() {
            let regPhone = /(^1[3456789][0-9]{9}$)|(^(\+?852\-?)?[569]\d{3}\-?\d{4}$)|(^(\+?886\-?|0)?9\d{8}$)|(^[6]([8|6])\d{5}$)/;
            if (!this.isFirst) {
                uni.showToast({
                    title: '请不要重复提交'
                });
                return;
            }
            if(!regPhone.test(this.detail.phone)){
                uni.showToast({
                    title: '请输入正确的手机号',
                    icon: 'none'
                });
                return;
            }
            this.addressStr = `${this.detail.name},${this.detail.phone},${this.detail.address}`;

            let time = new Date().getTime(),
                app_id = 103571, //快宝开放平台用户id
                key = '88d8dc66ec75cfa81c93028b6a11cb84dac136b7'; //快宝开放平台API key
            let [addressParse] = await http
                .post({
                    url: '/api',
                    data: {
                        app_id: app_id,
                        method: 'cloud.address.resolve',
                        ts: time,
                        sign: md5(app_id + 'cloud.address.resolve' + time + key),
                        data: JSON.stringify({ text: this.addressStr, multimode: false })
                    },
                    options: {
                        baseUrl: 'https://kop.kuaidihelp.com',
                        header: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                    }
                })
                .catch(() => {});

            this.detail = {
                address: addressParse.detail,
                area: addressParse.county_name,
                city: addressParse.city_name,
                province: addressParse.province_name,
                defaultEnable: this.detail.defaultEnable,
                name: addressParse.name,
                phone: addressParse.phone || addressParse.mobile,
                id: this.detail.id
            };
            let obj = Object.assign({}, this.detail);
            delete obj.isEdit;
            if (!obj.id) delete obj.id;
            const msgMap = {
                name:'请输入正确的姓名',
                province:'请输入正确的省份',
                city:'请输入正确的城市',
                area:'请输入正确的区县',
                address:'请输入详细地址'
            }
            for (let key of Object.keys(msgMap)) {
                if(!obj[key]){
                    uni.showToast({
                        title: msgMap[key],
                        icon: 'none'
                    });
                    return;
                }
            }
            if (!regPhone.test(obj.phone)) {
                uni.showToast({
                    title: '请输入正确的手机号',
                    icon: 'none'
                });
                return;
            }
            
            this.isFirst = false;
            if (this.status === 'add') {
                addAddress(obj)
                    .then(() => {
                        uni.navigateBack({});
                    })
                    .catch(() => {
                        this.isFirst = true;
                    });
            } else {
                updateAddress(obj)
                    .then(() => {
                        uni.navigateBack({});
                    })
                    .catch(() => {
                        this.isFirst = true;
                    });
            }
        }
    },
    onLoad(options) {
        if (options.detail) {
            this.status = 'update';
            this.detail = JSON.parse(options.detail);
            let address =
                this.detail.province === this.detail.city
                    ? this.detail.city + this.detail.area + this.detail.address
                    : this.detail.city === this.detail.area
                    ? this.detail.province + this.detail.city + this.detail.address
                    : this.detail.province + this.detail.city + this.detail.area + this.detail.address;
            this.detail.address = address;
            uni.setNavigationBarTitle({
                title: '修改地址'
            });
        }
    }
};
</script>

<style lang="scss">
page {
    background-color: #eee;
    padding-top: 20upx;
}
.textarea-container {
    height: 176upx;
    background-color: #fff;
    textarea {
        width: 100%;
        height: 100%;
        padding: 10px 16px;
        box-sizing: border-box;
    }
}
textarea,
input {
    font-size: 24upx;
    box-sizing: border-box;
}

.place {
    font-size: 24upx;
    color: #9b9b9b;
}
.address-detail-container {
    padding: 0 28upx;
    box-sizing: border-box;
    background-color: #fff;
    margin-top: 20upx;
    textarea {
        width: 100%;
        height: 156upx;
        padding-top: 20upx;
        border-bottom: 1px solid #eee;
    }
}
.phone {
    display: flex;
    border-bottom: 1px solid #eee;
    input {
        height: 88upx;
        line-height: 1;
        min-height: 1em;
        padding: 30upx 0;
    }
    input:last-child {
        position: relative;
        padding-left: 28upx;
        &:before {
            content: '';
            display: block;
            width: 4upx;
            height: 44upx;
            background-color: #eee;
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
        }
    }
}

.set-default-container {
    font-size: 24upx;
    color: #9b9b9b;
    line-height: 72upx;
    text-align: right;
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
