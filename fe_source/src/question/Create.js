/**
 * @file question/Create
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import san from 'san';
import {template} from './create.template.js';
import _ from 'lodash';
import * as AsyncValidator from 'async-validator';
import Form from 'san-xui/lib/x/forms/Form';
import FormItem from 'san-xui/lib/x/forms/FormItem';
import {TextBox, RadioBox, Toast, Button} from 'san-xui';

import service from '../service';
import {QUESTION_FLAGS, QUESTION_MAX_OPTION_LEN} from '../common/constants';

const Schema = AsyncValidator.default;
const formValidator = new Schema({
     topic: [
        {required: true, message: '题目不许为空'}
    ]
});

export default san.defineComponent({
    template,
    components: {
        'xui-textbox': TextBox,
        'xui-form': Form,
        'xui-item': FormItem,
        'xui-radiobox': RadioBox,
        'xui-button': Button
    },
    initData() {
        return {
            rules: formValidator,
            formData: {
                options: [
                    {label: 'A', text: '', isAnswer: false},
                    {label: 'B', text: '', isAnswer: false},
                    {label: 'C', text: '', isAnswer: false}
                ]
            },
            formErrors: null,
            maxOptionLength: QUESTION_MAX_OPTION_LEN,
            answerIndex: -1, // 第几个为正确答案 0 1 ...
            isUpdate: false // 是否是编辑
        }
    },
    inited() {
        this.resetOptions();
    },
    computed: {
        hasAnswer() {
            let hasAnswer = false;
            _.each(this.data.get('formData.options'), option => {
                hasAnswer = hasAnswer || option.isAnswer;
            });
            return hasAnswer;
        }
    },
    resetOptions() {
        const options = this.data.get('formData.options');
        _.each(options, (option, index) => {
            this.data.set(`formData.options[${index}].label`, QUESTION_FLAGS[index]);
            if (this.data.get('answerIndex') >= 0) {
                this.data.set(`formData.options[${index}].isAnswer`, index === this.data.get('answerIndex'));
            }
            this.data.set(`formData.options[${index}].itemName`, `option${index}Item`);
        });
    },
    deleteOption(index) {
        this.data.removeAt('formData.options', index);
        if (index === this.data.get('answerIndex')) {
            this.data.set('answerIndex', -1);
        }
        this.resetOptions();
    },
    createOption() {
        const newIndex = this.data.get('formData.options').length;
        this.data.push('formData.options', {
            label: QUESTION_FLAGS[newIndex],
            text: '',
            isAnswer: false
        });
        this.resetOptions();
    },
    onRadioChange(evt, index) {
        // 更新正确答案
        if (evt.target.checked) {
            this.data.set('answerIndex', index);
        }
        this.resetOptions();
    },
    validateData(itemName) {
        const payload = this.data.get('formData');
        let errorNum = 0;
        // topic验证
        if (!payload.topic) {
            errorNum++;
            if (itemName === 'topicName' || !itemName) {
                this.ref('topicItem').data.set('error', '题目不许为空');
            }
        }
        else {
            this.ref('topicItem').data.set('error', '');
        }
        // 选项验证
        _.each(payload.options, (option, index) => {
            if (option.text === '') {
                errorNum++;
                if (itemName === `option${index}Item` || !itemName) {
                    this.ref(`option${index}Item`).data.set('error', '选项不许为空');
                }
            }
            else {
                this.ref(`option${index}Item`).data.set('error', '');
            }
        });
        if (!this.data.get('hasAnswer')) {
            errorNum++;
        }
        return errorNum === 0;
    },
    validateInput(itemName) {
        this.nextTick(() => this.validateData(itemName));
    },
    filterData(data) {
        const formDataOptions = this.data.get('formData.options');
        const options = _.map(formDataOptions, 'text');
        const answerIndex = this.data.get('answerIndex');
        const inputData = {
            topic: data.topic,
            options,
            answer: options[answerIndex]
        };
        if (this.data.get('isUpdate') && this.data.get('id')) {
            inputData.id = this.data.get('id');
        }
        return inputData;
    },
    doSubmit() {
        const form = this.ref('form');
        const formData = this.data.get('formData');
        const validateResult = this.validateData();
        if (!validateResult) {
            return;
        }
        const payload = this.filterData(formData);
        const isUpdate = this.data.get('isUpdate');
        const funcName = isUpdate ? 'questionUpdate' : 'questionCreate';
        const successText = isUpdate ? '编辑成功！' : '添加成功！';
        // 数据验证成功了
        return form.validateForm()
            .then(() => service[funcName](payload))
            .then(() => Toast.success(successText))
            .then(() => this.fire('success'))
            .catch(errors => {
                this.data.set('formErrors', errors);
            });
    },
    onCloseDialog() {
        this.fire('closedialog');
    }
});
