package constant

import "time"

const (
	ERROR_CODE_OK          = 0
	ERROR_CODE_BAD_REQUEST = 1
	ERROR_CODE_UNKNOWN     = 2

	ERROR_MESSAGE_OK          = "operate ok."
	ERROR_MESSAGE_BAD_REQUEST = "bad request."
	ERROR_MESSAGE_UNKNOWN     = "internal server error."

	ERROR_MESSAGE_UPDATE_QUESTION    = "更新问题失败"
	ERROR_MESSAGE_CREATE_QUESTION    = "创建问题失败"
	ERROR_MESSAGE_DELETE_QUESTION    = "删除问题失败"
	ERROR_MESSAGE_QUERY_QUESTION     = "查询问题失败"
	ERROR_MESSAGE_QUESTION_NOT_EXIST = "问题不存在"
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
