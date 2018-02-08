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
import cyberplayer from '../common/cyberplayer/cyberplayer';
import Exam from './object/Exam';

export default san.defineComponent({
    template,
    components: {
        'xui-switch': Switch,
        'xui-textbox': TextBox,
        'xui-button': Button
    },
    initData() {
        return {
            exam: null,
            statusDisabled: true, // 开启按钮不可点
            sendAnswerDisabled: true, // 发送答案按钮是否禁用,
            sendQuestionLoading: false, // 正在发送题目标记,
            sendAnswerLoading: false // 正在发送答案标记
        }
    },
    computed: {
        questionDetail() {
            const question = this.data.get('exam.currentQuestion') || this.data.get('exam.lastQuestion');
            const userAnswerCount = this.data.get('exam.userAnswerCount');
            let questionDetail = '';
            if (question) {
                questionDetail += `题目${question.index}：${question.topic}<br />`;
                _.each(question.options, (option, index) => {
                    questionDetail += QUESTION_FLAGS[index] + '. ' + option;
                    // 用户答题人数显示
                    if (userAnswerCount && userAnswerCount[question.id] && userAnswerCount[question.id][option]) {
                        const klass = option === question.answer ? 'correct' : '';
                        questionDetail +=
                            `<span class="answer-count ${klass}">（${userAnswerCount[question.id][option]}人）</span>`;
                    }
                    if (option === question.answer) {
                        questionDetail += '<span class="right-tip">（正确答案）</span>';
                    }
                    if (index < question.options.length - 1) {
                        questionDetail += '<br />';
                    }
                });
            }
            return questionDetail;
        },
        sendAnswerDisabled() {
            return !this.data.get('exam.currentQuestion')
                || this.data.get('sendQuestionLoading') || this.data.get('sendAnswerLoading');
        }
    },
    inited() {
        this.exam = new Exam();
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
        const playUrlInfo = this.data.get('playUrlInfo');
        return service.statusDetail(playUrlInfo).then(res => {
            // 更新考试开启状态
            this.exam.isStarted = true;
            this.refreshExam();
            this.data.set('statusDisabled', false);
        });
    },
    refreshExam() {
        this.data.set('exam', this.exam.getData());
    },
    getAllQuestions() {
        return service.questionList().then(page => {
            const questions = page.result;
            if (!questions || questions.length === 0) {
                router.locator.redirect('/question/list');
            }
            else {
                this.exam.questions = questions;
            }
            this.refreshExam();
        });
    },
    onStatusChange(evt) {
        if (evt.value !== this.exam.isStarted) {
            const status = evt.value ? 1 : 0;
            const payload = _.extend({}, this.data.get('playUrlInfo'), {status});
            // 如果答题还在进行中，就结束，需要给出提示
            if (status === 0 && this.exam.status === 'PROCESSING') {
                confirm({
                    title: '注意',
                    message: '答题正在进行中，关闭后将用户将无法继续答题。确认关闭吗？',
                    width: 400
                }).then(() => this.updateExamStatus(payload))
                .catch(() => this.data.set('exam.isStarted', true));
            }
            else if (status === 1 && this.exam.status !== 'UNBEGIN') {
                // 如果题目状态还没初始化成功，则不能开始答题，给出提示
                alert({message: '题目未初始化成功，请先去修改题目状态'})
                    .then(() => this.data.set('exam.isStarted', false));
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
        if (!this.exam.isStarted || question.status !== 'UNBEGIN') {
            return;
        }
        if (!this.exam.canSendQuestion(question)) {
            // 如果之前还有题没打完，则需要给提示
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
                // 当前题目状态修改
                this.exam.currentQuestion = question;
                this.exam.lastQuestion = null;
                const actualIndex = question.index - 1;
                this.exam.questions[actualIndex].currentStatus = 'DOING';
                this.exam.questions[actualIndex].disabled = true; // 不能再点了
                this.refreshExam();
                // 获取最新数据
                this.getAllQuestions();
                this.data.set('sendQuestionLoading', false);
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
                // 答题结果
                this.exam.userAnswerCount[question.id] = res.userAnswerCount;
                // 删除现在正在答的题
                this.exam.currentQuestion = null;
                this.exam.lastQuestion = question;
                // 修改刚答完这题的状态
                const actualIndex = question.index - 1;
                this.exam.questions[actualIndex].currentStatus = 'INACTIVE';
                console.log(this.exam.questions[actualIndex]);
                this.refreshExam();
                // 获取最新数据
                this.getAllQuestions();
                this.data.set('sendAnswerLoading', false);
            }).catch(errors => {
                this.data.set('sendAnswerLoading', false);
            });
    },
    disposed() {
        this.player && this.player.remove();
    }
});