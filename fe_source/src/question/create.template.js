/**
 * @file question/create.template.js
 * @author zhangzhe(zhangzhe@baidu.com)
 */

export const template = `
<template>
<div class="idati-question-create">
    <xui-form s-ref="form" rules="{{rules}}" formData="{=formData=}" errors="{=formErrors=}" label-width="{{50}}">
        <xui-item name="topic" required inline label="题目：" s-ref="topicItem">
            <xui-textbox type="text" placeholder="题目" value="{=formData.topic=}" width="{{290}}" on-input="validateInput('topicItem')"/>
            <div class="extra-config">
                <span class="col col1">正确答案</span>
                <span class="col col2">操作</span>
            </div>
        </xui-item>
        <xui-item s-for="option, index in formData.options" name="option{{index}}"
            required inline label="{{option.label}}" s-ref="option{{index}}Item">
            <xui-textbox type="text" value="{=option.text=}"
                width="{{290}}" on-input="validateInput(option.itemName)"/>
            <div class="extra-config">
                <span class="col col1">
                    <input type="radio" name="answer" checked="{=option.isAnswer=}" on-change="onRadioChange($event, index)" />
                </span>
                <span class="col col2">
                    <a s-if="formData.options.length > 2" href="javascript:;" on-click="deleteOption(index)">删除</a>
                </span>
            </div>
        </xui-item>
        <xui-item label-width="{{50}}" inline label=" ">
            <a s-if="formData.options.length < maxOptionLength" href="javascript:;" class="create-option" on-click="createOption">
                <i class="iconfont icon-icon-test"></i>添加更多选项
            </a>
            <span s-else class="tip">当前至多支持{{maxOptionLength}}个选项</span>
        </xui-item>
        <xui-item s-if="!hasAnswer" label-width="{{50}}" inline label=" ">
            <span class="option-tip">至少选择1个正确答案</span>
        </xui-item>
    </xui-form>
    <div class="foot">
        <xui-button on-click="doSubmit" skin="primary">确认</xui-button>
        <xui-button on-click="onCloseDialog">取消</xui-button>
    </div>
</div>
</template>
`;

    