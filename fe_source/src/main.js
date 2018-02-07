/**
 * @file 项目主入口
 * @author zhangzhe(zhangzhe@baidu.com)
 */

import {router} from 'san-router';

import ApplicationManager from './app/manager';

// style
import 'san-xui/dist/xui.css';
import './style.less';

// actions
// import './playurl/action';

// config route
import PlayurlIndex from './playurl/Index';
import QuestionList from './question/List';
import QuestionCreate from './question/Create';
import ExamIndex from './exam/Index';

function routerConfig() {
    router.add({rule: '/', Component: PlayurlIndex, target: '#app'});
    router.add({rule: '/playurl/index', Component: PlayurlIndex, target: '#app'});
    router.add({rule: '/question/list', Component: QuestionList, target: '#app'});
    router.add({rule: '/question/create', Component: QuestionCreate, target: '#app'});
    router.add({rule: '/exam/index', Component: ExamIndex, target: '#app'});

    router.start();
}

function start() {
    return ApplicationManager.start().then(() => {
        // 路由配置
        routerConfig();
    });
}

start();
