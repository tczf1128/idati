/**
 * @file common/Header.es6
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import san from 'san';

import logoImg from './img/logo.png';
import step1Img from './img/step1.png';
import step2Img from './img/step2.png';
import step3Img from './img/step3.png';

const template = `<template>
<div class="main-header">
    <img class="idati-logo" width="85" height="32" src="${logoImg}" />
    <h1>直播答题——出题方</h1>
</div>
<div class="sub-header">
    <div class="steps">
        <div class="step1 step">
            <a href="#/playurl/index"><img width="60" height="60" src="${step1Img}" /></a>
            <div>直播地址配置</div>
        </div>
        <div class="split split1"><div class=""></div></div>
        <div class="step2 step">
            <a href="#/question/list"><img width="60" height="60" src="${step2Img}" /></a>
            <div>题目编辑</div>
        </div>
        <div class="split split2"></div>
        <div class="step3 step">
            <a href="#/exam/index"><img width="60" height="60" src="${step3Img}" /></a>
            <div>直播出题</div>
        </div>
    </div>
</div>
</template>`;
/* eslint-enable */

export default san.defineComponent({
    template
});