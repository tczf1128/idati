package constant

import (
	"time"

	"github.com/idati/model"
)

var (
	ErrorParams  = model.ErrorMessage{"请求参数错误"}
	ErrorUnknown = model.ErrorMessage{"服务器错误"}

	ErrorQuestionNotExist = model.ErrorMessage{"问题不存在"}
	ErrorQuestionSend     = model.ErrorMessage{"发送问题失败"}
	ErrorQuestionCreate   = model.ErrorMessage{"创建问题失败"}
	ErrorQuestionUpdate   = model.ErrorMessage{"更新问题失败"}
	ErrorQuestionDelete   = model.ErrorMessage{"删除问题失败"}
	ErrorQuestionList     = model.ErrorMessage{"查询问题列表失败"}
	ErrorQuestionDetail   = model.ErrorMessage{"查询问题详情失败"}

	ErrorLiveInfoNotExist = model.ErrorMessage{"流地址不存在"}

	ErrorGetPlayCount = model.ErrorMessage{"获取播放人数失败"}
)

const (
	REDIS_DEFAULT_EXPIRATION     = 6000 * time.Second
	REDIS_LIVE_STREAM_INFO_KEY   = "LIVE_STREAM_INFO"
	REDIS_LIVE_QUESTION_LIST_KEY = "LIVE_QUESTION_LIST"
)

const (
	QUESTION_STATUS_UNBDEGIN   = "UNBEGIN"
	QUESTION_STATUS_PROCESSING = "PROCESSING"
	QUESTION_STATUS_FINISHED   = "FINISHED"
)
