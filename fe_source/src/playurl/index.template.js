/**
 * @file playurl/index.template.js
 * @author zhangzhe(zhangzhe@baidu.com)
 */

export const template = `
<template>
<div class="idati-main-wrap idati-playurl-index">
    <h2>直播地址配置</h2>
    <div class="idati-playurl-form">
        <xui-toastlabel text="请填写有效的百度云音视频直播拉流地址，并保证观看端demo所填地址与其匹配。" />
        <xui-form s-ref="form" rules="{{rules}}" formData="{=formData=}" errors="{=formErrors=}" label-width="{{130}}">
            <xui-item name="playUrl" required inline label="拉流地址：" s-ref="playUrlItem">
                <xui-textbox type="text" placeholder="拉流地址" value="{=formData.playUrl=}" width="{{420}}" />
            </xui-item>
            <xui-item class="opt-content">
                <xui-button on-click="doSubmit" skin="primary" class="submit-btn" disabled="{{disabled}}">
                    {{loading ? '提交中...' : '下一步'}}
                </xui-button>
            </xui-item>
        </xui-form>
    </div>
</div>
</template>
`;

    