/**
 * @file pullurl/Index.es6
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import san from 'san';
import {router} from 'san-router';
import {connect} from 'san-store';
import _ from 'lodash';
import * as AsyncValidator from 'async-validator';
import Form from 'san-xui/lib/x/forms/Form';
import FormItem from 'san-xui/lib/x/forms/FormItem';
import {ToastLabel, TextBox, Button, Toast} from 'san-xui';

import {template} from './index.template.js';
import service from '../service';

const Schema = AsyncValidator.default;
const formValidator = new Schema({
    playUrl: [
        {required: true, message: '拉流地址必填'}
    ]
});


let MyComponent = san.defineComponent({
    template,
    components: {
        'xui-toastlabel': ToastLabel,
        'xui-textbox': TextBox,
        'xui-form': Form,
        'xui-item': FormItem,
        'xui-button': Button
    },
    initData() {
        return {
            loading: false,
            rules: formValidator,
            formData: {},
            formErrors: null
        }
    },
    computed: {
        disabled() {
            return !this.data.get('formData.playUrl') || this.data.get('loading');
        }
    },
    attached() {
        this.getPullUrl();
    },
    getPullUrl() {
        return service.playUrlDetail().then(playUrlInfo => {
            this.data.set('formData.playUrl', playUrlInfo.playUrl);
        });
    },
    doSubmit() {
        const form = this.ref('form');
        const payload = this.data.get('formData');
        return form.validateForm().then(() => {
            this.data.set('loading', true);
            return service.playUrlUpdate(payload);
        }).then(() => {
            this.data.set('loading', false);
            Toast.success('拉流地址配置成功！');
            router.locator.redirect('/question/list');
        }).catch(errors => {
            this.data.set('loading', false);
            if (errors && errors.global) {
                this.nextTick(() => this.ref('pullUrlItem').data.set('error', errors.global));
            }
            this.data.set('formErrors', errors);
        });
    }
});

export default MyComponent;
