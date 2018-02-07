/**
 /**
 * @file 数据请求服务
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import axios from 'axios';
import Promise from 'promise';

import api from './config/api';
import {Toast} from 'san-xui';

function ajax(url, data) {
    data = data || {};
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(url, data);
            if (response.data.success) {
                if (response.data.result) {
                    resolve(response.data.result);
                }
                else if (response.data.page) {
                    resolve(response.data.page);
                }
                else {
                    resolve();
                }
            }
            else {
                if (response.data.message) {
                    if (response.data.message.global) {
                        Toast.error(response.data.message.global);
                    }
                    reject(response.data.message);
                }
                else {
                    reject(undefined);
                }
            }
        }
        catch (err) {
            reject(err);
        }
    });
}

export default {
    playUrlDetail(data) {
        return ajax(api.idatiPlayUrlDetail, data);
    },
    playUrlUpdate(data) {
        return ajax(api.idatiPlayUrlUpdate, data);
    },

    questionList(data) {
        return ajax(api.idatiQuestionList, data);
    },
    questionDelete(data) {
        return ajax(api.idatiQuestionDelete, data);
    },
    questionCreate(data) {
        return ajax(api.idatiQuestionCreate, data);
    },
    questionUpdate(data) {
        return ajax(api.idatiQuestionUpdate, data);
    },
    questionSend(data) {
        return ajax(api.idatiQuestionSend, data);
    },
    questionStandardAnswer(data) {
        return ajax(api.idatiQuestionStandardAnswer, data);
    },

    statusDetail(data) {
        return ajax(api.idatiStatusDetail, data);
    },
    statusUpdate(data) {
        return ajax(api.idatiStatusUpdate, data);
    },

    statusDetail(data) {
        return ajax(api.idatiStatusDetail, data);
    },
    statusUpdate(data) {
        return ajax(api.idatiStatusUpdate, data);
    }
};
