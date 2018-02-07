package storage

import (
	"github.com/gin-gonic/contrib/cache"
	"github.com/sirupsen/logrus"

	"github.com/idati/constant"
	"github.com/idati/model"
)

var RedisClient *cache.RedisStore

func IncrementAnswerCount(answerRequest model.SendAnswerRequest) error {
	topic := answerRequest.Answer.Topic
	option := answerRequest.Answer.Option
	countMap := make(map[string]int64)
	RedisClient.Get(topic, &countMap)
	countMap[option] += 1
	err := RedisClient.Set(topic, &countMap, constant.REDIS_DEFAULT_EXPIRATION)
	if err != nil {
		logrus.Errorf("set user count map error, topic=%s, err=%v\n", topic, err)
	}

	return err
}
