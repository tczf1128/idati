/**
 * @file exam/Index.es6 直播出题
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import san from 'san';
import {router} from 'san-router';
import _ from 'lodash';
import {Switch, TextBox, Button, Toast} from 'san-xui';
import {alert, confirm} from 'san-xui/lib/x/biz/helper';

import {template} from './index.template.js';
import service from '../service';
import {QUESTION_FLAGS} from '../common/constants';
import {getQuestionTotalStatus, getQuestionCurrentStatus, canSendQuestion, getQuestionTextShow} from '../common/common';
import cyberplayer from '../common/cyberplayer/cyberplayer';

export default san.defineComponent({
    template,
    components: {
        'xui-switch': Switch,
        'xui-textbox': TextBox,
        'xui-button': Button
    },
    initData() {
        return {
            playUrlInfo: null,
            statusDisabled: true,
            isStarted: false, // 答题是否开始
            sendAnswerDisabled: true, // 发送答案按钮是否禁用
            currentQuestion: null, // 当前正在答的题目
            sendQuestionLoading: false // 正在发送题目标记
        }
    },
    computed: {
        questionDetail() {
            const question = this.data.get('currentQuestion') || this.data.get('lastQuestion');
            const userAnswerCount = this.data.get('userAnswerCount');
            let questionDetail = '';
            if (question) {
                questionDetail += `题目${question.index}：${question.topic}<br />`;
                _.each(question.options, (option, index) => {
                    questionDetail += QUESTION_FLAGS[index] + '. ' + option;
                    if (userAnswerCount && userAnswerCount[option]) {
                        const klass = option === question.answer ? 'correct' : '';
                        questionDetail += `<span class="answer-count ${klass}">（${userAnswerCount[option]}人）</span>`;
                    }
                    if (option === question.answer) {
                        questionDetail += '<span class="right-tip">（正确答案）</span>';
                    }
                    if (index < question.options.length - 1) {
                        questionDetail += '<br />';
                    }
                });
                return questionDetail;
            }
            return '';
        },
        sendAnswerDisabled() {
            return this.data.get('currentQuestion') == null
                || this.data.get('sendQuestionLoading')
                || this.data.get('sendAnswerLoading');
        },
        currentQuestion() {
            // 正在答的题目, 代表现在正在答题
            let currentQuestion = null;
            _.each(this.data.get('questions'), question => {
                if (question.currentStatus === 'DOING') {
                    currentQuestion = question;
                    return;
                }
            });
            return currentQuestion;
        }
    },
    attached() {
        // 先获取考试状态，再去拿所有题目
        this.getPullUrl()
            .then(() => this.setupVideo())
            .then(() => this.getExamStatus())
            .then(() => this.getAllQuestions());
    },
    getPullUrl() {
        return service.playUrlDetail().then(playUrlInfo => {
            if (playUrlInfo && playUrlInfo.playUrl) {
                this.data.set('playUrlInfo', playUrlInfo);
            }
            else {
                router.locator.redirect('/playurl/index');
            }
        });
    },
    setupVideo() {
        this.player = cyberplayer('playerContainer').setup({
            flashplayer: 'https://cdn.bdstatic.com/jwplayer/latest/cyberplayer.flash.swf',
            width: 220,
            height: 420,
            file: this.data.get('playUrlInfo').playUrl,
            autostart: true,
            isLive: true,
            stretching: 'uniform',
            volume: 100,
            controls: false,
            ak: "41707430fa52422f83b8efdc797f90c1",
            controlbar: {
                barLogo: false
            }
        });
    },
    getExamStatus() {
        const payload = this.data.get('playUrlInfo');
        return service.statusDetail(payload).then(res => {
            this.data.set('isStarted', res.status === 1);
            this.data.set('statusDisabled', false);
        });
    },
    getAllQuestions() {
        const isStarted = this.data.get('isStarted');
        return service.questionList().then(page => {
            const questions = page.result;
            _.each(questions, (question, index) => {
                question.index = index + 1;
                // 题目当下的状态：重要的状态！！
                question.currentStatus = getQuestionCurrentStatus(question, questions, isStarted);
                // 是否可以点击发送题目
                question.disabled = question.currentStatus !== 'NORMAL';
                question.textShow = getQuestionTextShow(question);
            });
            // 题目
            this.data.set('questions', questions);
            // 获得整套题目的状态
            this.data.set('questionTotalStatus', getQuestionTotalStatus(questions));
        });
    },
    onStatusChange(evt) {
        // 答题状态修改
        if (!evt.value === this.data.get('isStarted')) {
            const status = evt.value ? 1 : 0;
            // 题目的整体状态
            const questionTotalStatus = this.data.get('questionTotalStatus');
            let payload = _.extend({}, this.data.get('playUrlInfo'), {status});
            // 如果答题还在进行中，就结束，需要给出提示
            if (status === 0 && questionTotalStatus === 'PROCESSING') {
                confirm({
                    title: '注意',
                    message: '答题正在进行中，关闭后将用户将无法继续答题。确认关闭吗？',
                    width: 400
                }).then(() => this.updateExamStatus(payload))
                .catch(() => this.data.set('isStarted', true));
            }
            else if (status === 1 && questionTotalStatus !== 'UNBEGIN') {
                // 如果题目状态还没初始化成功，则不能开始答题，给出提示
                alert({message: '题目未初始化成功，请先去修改题目状态'})
                    .then(() => this.data.set('isStarted', false));
            }
            else {
                this.updateExamStatus(payload);
            }
        }
    },
    updateExamStatus(payload) {
        this.data.set('statusDisabled', true);
        const toastText = payload.status === 1 ? '直播正式开始' : '直播已关闭';
        // 更新答题状态
        service.statusUpdate(payload)
            .then(() => Toast.success(toastText))
            .then(() => {
                location.reload();
            })
            .catch(errors => {
                this.data.set('statusDisabled', false);
            });
    },
    onQuestionClick(question) {
        // 再进行状态验证
        if (!this.data.get('isStarted') || question.status !== 'UNBEGIN') {
            return;
        }
        if (!canSendQuestion(question, this.data.get('questions'))) {
            // 如果不是正常发送题目情况，需要给提示，比如之前还有题没打完
            confirm({
                title: '注意',
                message: `之前有题目未答完，是否发送题目${question.index}？`,
                width: 400
            }).then(() => this.sendQuestion(question));
        }
        else {
            this.sendQuestion(question);
        }
    },
    sendQuestion(question) {
        // 发送题目
        this.data.set('sendQuestionLoading', true);
        service.questionSend({id: question.id})
            .then(() => {
                this.data.set('sendQuestionLoading', false);
                // 当前正在答的题目
                this.data.set('currentQuestion', question);
                // 上一道题数据清空
                this.data.set('lastQuestion', null);
                this.data.set('userAnswerCount', null);
                // 发送答案按钮激活
                this.data.set('sendAnswerDisabled', false);
                // 当前题目状态修改
                const actualIndex = question.index - 1;
                this.data.set(`questions[${actualIndex}].currentStatus`, 'DOING');
                this.data.set(`questions[${actualIndex}].disabled`, true);
                // 获取最新数据
                this.getAllQuestions();
            }).catch(errors => {
                this.data.set('sendQuestionLoading', false);
            });
    },
    onSendAnswerClick(question) {
        // 状态检查
        if (question.currentStatus !== 'DOING') {
            return;
        }
        this.data.set('sendAnswerLoading', true);
        service.questionStandardAnswer({id: question.id})
            .then(res => {
                this.data.set('sendAnswerLoading', false);
                // 答题结果
                this.data.set('userAnswerCount', res.userAnswerCount);
                // 删除现在正在答的题
                this.data.set('currentQuestion', null);
                this.data.set('lastQuestion', question);
                // 修改刚答完这题的状态
                const actualIndex = question.index - 1;
                this.data.set(`questions[${actualIndex}].currentStatus`, 'INACTIVE');
                // 获取最新数据
                this.getAllQuestions();
            }).catch(errors => {
                this.data.set('sendAnswerLoading', false);
            });
    }
});