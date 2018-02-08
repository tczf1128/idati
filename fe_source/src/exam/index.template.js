/**
 * @file exam/index.template.js
 * @author zhangzhe(zhangzhe@baidu.com)
 */

/* eslint-disable */
export const template = `
<div class="idati-main-wrap idati-exam-index">
    <h2>直播出题</h2>
    <div class="idati-exam-content">
        <div class="video-container">
            <div id="playerContainer"></div>
        </div>
        <div class="exam-content">
            <div class="status-content">
                <label>开始直播：</label>
                <xui-switch checked="{=exam.isStarted=}" on-change="onStatusChange" disabled="{{statusDisabled}}"/>
                <span s-if="!exam.isStarted" class="status-tip">（开启后方可发送题目）</span>
            </div>
            <div class="exam-questions">
                <div class="questions">
                    <xui-button s-for="question in exam.questions" on-click="onQuestionClick(question)"
                        skin="primary" class="question-btn status-{{question.currentStatus}}" disabled="{{question.disabled || sendQuestionLoading}}">
                        {{question.textShow}}
                    </xui-button>
                </div>
            </div>
            <div class="question-preview-content">
                <h3>题目预览</h3>
                <div s-if="exam.currentQuestion || exam.lastQuestion" class="preview-container">{{questionDetail | raw}}</div>
                <div s-else class="preview-container inactive-preview-container"><div class="inactive-tip">暂未出题</div></div>
                <div>
                    <xui-button on-click="onSendAnswerClick(exam.currentQuestion)"
                        skin="primary" class="answer-btn" disabled="{{sendAnswerDisabled}}">
                        {{exam.currentQuestion && !sendAnswerDisabled ? '发送（题目' + exam.currentQuestion.index + '）答案'  : '发送答案'}}
                   </xui-button>
                </div>
            </div>
        </div>
    </div>
</div>
`;
/* eslint-enable */
