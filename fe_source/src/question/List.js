/**
 * @file question/List.js
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import san from 'san';
import {router} from 'san-router';
import _ from 'lodash';
import {Loading, Toast, Button} from 'san-xui';

import service from '../service';
import {getAnswerFlag} from '../common/common';
import QuestionBlock from './QuestionBlock';
import {confirm} from 'san-xui/lib/x/biz/helper';
import {Dialog} from 'san-xui';
import QuestionCreate from './Create';
import { updateLocale } from 'moment';

/* eslint-disable */
const template = `<template>
<div class="idati-main-wrap idati-question-list">
    <h2>题目编辑</h2>
    <div class="question-list-content">
        <xui-loading s-if="loading" />
        <div class="questions">
            <idati-question s-for="question, index in questions" question="{{question}}" on-delete="onDelete" on-update="onUpdate" />
        </div>
        <div s-if="!loading" class="create-opt">
            <a href="javascript:;" class="create-btn" on-click="createOrUpdateQuestion()"><i class="iconfont icon-icon-test"></i>添加题目</a>
        </div>
        <div s-if="!loading" class="next-step-content">
            <xui-button on-click="lastStep" skin="primary" class="last-btn" >上一步</xui-button>
            <xui-button on-click="nextStep" skin="primary" class="next-btn" disabled="{{nextDisabled}}">开始出题</xui-button>
        </div>
    </div>
</div>
<xui-dialog open="{=dialog.showDialog=}" width="{{dialog.width}}" foot="{{dialog.foot}}">
    <div slot="head">{{dialog.title}}</div>
    <idati-question-create on-closedialog="onCloseDialog" on-success="onCreateSuccess"
        id="{{updateQuestion.id}}"
        isUpdate="{{updateQuestion.isUpdate}}"
        formData="{{updateQuestion.formData}}"
        answerIndex="{{updateQuestion.answerIndex}}" />
</xui-dialog>
</template>`;
/* eslint-enable */

export default san.defineComponent({
    template,
    components: {
        'xui-loading': Loading,
        'xui-button': Button,
        'idati-question': QuestionBlock,
        'xui-dialog': Dialog,
        'idati-question-create': QuestionCreate
    },
    initData() {
        return {
            loading: true,
            dialog: {
                title: '',
                showDialog: false
            }
        };
    },
    computed: {
        nextDisabled() {
            const questions = this.data.get('questions');
            return !(questions && questions.length > 0);
        }
    },
    attached() {
        this.getQuestionList();
    },
    getQuestionList() {
        return service.questionList().then(page => {
            this.data.set('loading', false);
            const questions = page.result;
            _.each(questions, (question, index) => {
                question.answerFlag = getAnswerFlag(question.options, question.answer);
                question.index = index + 1;
            });
            this.data.set('totalCount', questions.length);
            this.data.set('questions', questions);
        });
    },
    onDelete(evt) {
        const question = evt.question;
        const title = '删除提示';
        const message = `您确定删除 "题目${question.index}：${question.topic}" 么？`;
        confirm({title, message, width: 400})
            .then(() => service.questionDelete({id: question.id}))
            .then(() => Toast.success('删除成功！'))
            .then(() => this.getQuestionList());
    },
    onUpdate(evt) {
        const question = evt.question;
        this.createOrUpdateQuestion(question);
    },
    lastStep() {
        router.locator.redirect('/playurl/index');
    },
    nextStep() {
        router.locator.redirect('/exam/index');
    },
    createOrUpdateQuestion(question) {
        const nextIndex = this.data.get('totalCount') + 1;
        const title = question ? `编辑题目${question.index}` : `添加题目${nextIndex}`;
        const options = {
            showDialog: true,
            title,
            width: 600,
            foot: false
        };
        // 编辑题目的输入数据准备
        if (question) {
            const updateQuestion = {
                isUpdate: true,
                id: question.id,
                formData: {
                    topic: question.topic,
                    options: _.map(question.options, option => {
                        return {
                            label: question.answerFlag,
                            text: option,
                            isAnswer: option === question.answer
                        };
                    })
                },
                answerIndex: _.indexOf(question.options, question.answer)
            };
            this.data.set('updateQuestion', updateQuestion);
        }
        // 显示弹框
        this.data.set('dialog', options);
    },
    onCloseDialog() {
        this.data.set('dialog.showDialog', false);
    },
    onCreateSuccess() {
        // 成功之后做的事情
        this.onCloseDialog();
        this.getQuestionList();
    }
});
