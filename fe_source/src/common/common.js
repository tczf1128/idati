/**
 * @file common/common.js
 * @author zhangzhe@baidu.com
 */
import _ from 'lodash';

import {QUESTION_FLAGS} from './constants';

export function getAnswerFlag(options, answer) {
    // A or B or C
    const index = _.indexOf(options, answer);
    return QUESTION_FLAGS[index];
}

/*
 * 获得题目的整体状态 UNBEGIN-未开始 | PROCESSING-出题中 | FINISHED-已结束
 * 所有都没开始，则返回未开始
 * 所有都结束，则返回结束
 * 其他行况下，都返回进行中
 */
export function getQuestionTotalStatus(questions) {
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

/*
 * 获得某一题当下的实时状态，注意和原始状态的区分 NORMAL | DOING | INACTIVE
 * @params: question-本题 questions-所有题 isStarted-考试状态（true|false）
 * 1. NORMAL (蓝色，可点击状态): 考试在进行中 && 没有其他题目在进行中 && 自己状态是'UNBEGIN'
 * 2. DOING (黄色，不可点击状态): 考试在进行中 && 自己状态是'PROCESSING'
 * 3. INACTIVE (灰色，不可点击状态)： 考试未开始 || 自己状态是'FINISHED' || 其他有题目在进行中
 * ps: 理论上，没有其他情况，为了保险其他情况下都返回INACTIVE
 */
export function getQuestionCurrentStatus(question, questions, isStarted) {
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

export function getQuestionTextShow(question) {
    const questionIndex = question.index;
    if (question.currentStatus === 'DOING') {
        return `题目${questionIndex}-出题中`;
    }
    else if (question.status === 'FINISHED') {
        return `题目${questionIndex}-已结束`;
    }
    return `发送题目${questionIndex}`;
}

export function canSendQuestion(question, questions) {
    let wrongNum = 0;
    _.each(questions, q => {
        if (q.index < question.index && q.status !== 'FINISHED') {
            wrongNum++;
        }
    });
    return wrongNum === 0;
}
