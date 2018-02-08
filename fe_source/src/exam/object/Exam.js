/**
 * @file exam/object/Exam.es6 考试对象
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import _ from 'lodash';

/**
 * 获得题目的整体状态 UNBEGIN-未开始 | PROCESSING-出题中 | FINISHED-已结束
 * 所有都没开始，则返回未开始
 * 所有都结束，则返回结束
 * 其他行况下，都返回进行中
 */
function getQuestionTotalStatus(questions) {
    const unbeginQuestions = _.filter(questions, question => question.status === 'UNBEGIN');
    const finishedQuestions = _.filter(questions, question => question.status === 'FINISHED');
    if (unbeginQuestions.length === questions.length) {
        return 'UNBEGIN';
    }
    else if (finishedQuestions.length === questions.length) {

        return 'FINISHED';
    }
    return 'PROCESSING';
}

/**
 * 获得某一题当下的实时状态，注意和原始状态的区分 NORMAL | DOING | INACTIVE
 * @params: question-本题 questions-所有题 isStarted-考试状态（true|false）
 * 1. NORMAL (蓝色，可点击状态): 考试在进行中 && 没有其他题目在进行中 && 自己状态是'UNBEGIN'
 * 2. DOING (黄色，不可点击状态): 考试在进行中 && 自己状态是'PROCESSING'
 * 3. INACTIVE (灰色，不可点击状态)： 考试未开始 || 自己状态是'FINISHED' || 其他有题目在进行中
 * ps: 理论上，没有其他情况，为了保险其他情况下都返回INACTIVE
 */
function getQuestionCurrentStatus(question, questions, isStarted) {
    const processingQuestions = _.filter(questions, question => question.status === 'PROCESSING');
    if (isStarted && question.status === 'UNBEGIN' && processingQuestions.length === 0) {
        return 'NORMAL';
    }
    else if (isStarted && question.status === 'PROCESSING') {
        return 'DOING';
    }
    else if (!isStarted || question.status === 'FINISHED' || processingQuestions.length > 0) {
        return 'INACTIVE';
    }
    return 'INACTIVE';
}

function getQuestionTextShow(question) {
    const questionIndex = question.index;
    if (question.currentStatus === 'DOING') {
        return `题目${questionIndex}-出题中`;
    }
    else if (question.status === 'FINISHED') {
        return `题目${questionIndex}-已结束`;
    }
    return `发送题目${questionIndex}`;
}

export default class Exam {

    constructor() {
        // 是否已开启直播
        this.isStarted = false;
        // 所有题目
        this.questions = [];
        // 整体试卷的状态 UNBEGIN-未开始 | PROCESSING-出题中 | FINISHED-已结束
        this.status = 'UNBEGIN';
        // 当前正在答的题目
        this.currentQuestion = null;
        // 上一题
        this.lastQuestion = null;
        // 用户答题情况数据
        this.userAnswerCount = {};
    }

    canSendQuestion(question) {
        let wrongNum = 0;
        _.each(this.questions, q => {
            if (q.index < question.index && q.status !== 'FINISHED') {
                wrongNum++;
            }
        });
        return wrongNum === 0;
    }

    get questions() {
        return this._questions;
    }

    set questions(questions) {
        _.each(questions, (question, index) => {
            question.index = index + 1;
            // 题目当下的状态：重要的状态！！
            question.currentStatus = getQuestionCurrentStatus(question, questions, this.isStarted);
            // 是否可以点击发送题目
            question.disabled = question.currentStatus !== 'NORMAL';
            question.textShow = getQuestionTextShow(question);
        });
        this.refreshStatus(questions);
        this._questions = questions;
    }

    refreshStatus(questions) {
        questions = questions || this.questions;
        this.status = getQuestionTotalStatus(questions); // 更新试卷的整体状态
        this.currentQuestion = this.getCurrentQuestion(questions); // 获得当前正在进行的题
    }

    getCurrentQuestion(questions) {
        let currentQuestion = null;
        _.each(questions, question => {
            if (question.currentStatus === 'DOING') {
                currentQuestion = question;
                return;
            }
        });
        return currentQuestion;
    }

    getData() {
        return {
            isStarted: this.isStarted,
            questions: this._questions,
            status: this.status,
            currentQuestion: this.currentQuestion,
            lastQuestion: this.lastQuestion,
            userAnswerCount: this.userAnswerCount
        };
    }

}
