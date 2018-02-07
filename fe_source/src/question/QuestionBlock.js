/**
 * @file question/QuestionBlock.es6
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import san from 'san';

import {QUESTION_FLAGS} from '../common/constants';

/* eslint-disable */
const template = `<template>
<div class="question-block">
    <label class="index-label">题目{{question.index}}</label>
    <div class="question-content">
        <div class="topic-content">
            <span class="topic">{{question.topic}}</span>
            <div class="opts">
                <a href="javascript:;" on-click="onUpdate"><i class="iconfont icon-edit"></i>编辑</a>
                <a href="javascript:;" on-click="onDelete"><i class="iconfont icon-shanchu"></i>删除</a>
            </div>
        </div>
        <div class="option-content">
            <div s-for="option, index in question.options" class="option">
                <span class="option-label">{{index | optionLabel}}</span>{{option}}
            </div>
        </div>
        <div class="answer">正确答案：{{question.answerFlag}}</div>
    </div>
</div>
</template>`;
/* eslint-enable */

export default san.defineComponent({
    template,
    onUpdate() {
        const question = this.data.get('question');
        this.fire('update', {question});
    },
    onDelete() {
        const question = this.data.get('question');
        this.fire('delete', {question});
    },
    filters: {
        optionLabel(index) {
            return QUESTION_FLAGS[index];
        }
    }
});
