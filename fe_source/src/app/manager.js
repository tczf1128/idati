/**
 * @file app/manager.es6
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import Promise from 'promise';

import Header from '../common/Header';

class ApplicationManager {
    constructor() {
    }

    initHeader() {
        const myHeader = new Header();
        myHeader.attach(document.getElementById('header'));
    }

    start() {
        // 头部初始化
        this.initHeader();
        return Promise.resolve(true);
    }

    dispose() {}
}

export default new ApplicationManager();

