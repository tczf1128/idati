package service

import (
	"encoding/json"

	bceauth "baidubce.com/auth"
	"baidubce.com/service/lss"
	"github.com/idati/config"
	"github.com/idati/constant"
	"github.com/idati/model"
	"github.com/idati/storage"
	"github.com/sirupsen/logrus"
)

func SendAnswer(question model.Question) error {
	body := lss.Metadata{
		Metadata: make(map[string]string),
	}
	var answerCountMap map[string]int64
	err := storage.RedisClient.Get(question.Topic, &answerCountMap)
	if err != nil {
		logrus.Errorf("get user count map error, %v\n", err)
	}

	for k, v := range answerCountMap {
		logrus.Debugf("%s=>%d\n", k, v)
	}

	var liveStreamInfo model.LiveStreamInfo
	storage.RedisClient.Get(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo)
	qaMetadata := model.QAMetadata{
		Question:        question,
		StandardAnswer:  question.Answer,
		UserAnswerCount: answerCountMap,
	}
	jstring, err := json.Marshal(qaMetadata)
	body.Metadata["metadata"] = string(jstring)

	err = storage.RedisClient.Delete(question.Topic)
	if err != nil {
		logrus.Errorf("clear user count map error, topic=%s, err=%v\n",
			question.Topic, err)
	}

	logrus.Infof("send standard answer, body=%v\n", body)
	request := &lss.MetadataRequest{
		PlayDomain: liveStreamInfo.PlayDomain,
		App:        liveStreamInfo.App,
		Stream:     liveStreamInfo.Stream,
		Metadata:   body,
	}

	credential :=
		bceauth.NewBceCredentials(config.Config.User.AccessKeyId, config.Config.User.SecretAccessKey)
	lssClient, _ := lss.NewClient(credential)
	err = lssClient.AddMetadata(request)
	if err != nil {
		logrus.Errorf("add metadata error, %v\n", err)
	}

	return err
}

func SendQuestion(question model.Question) error {
	body := lss.Metadata{
		Metadata: make(map[string]string),
	}
	qaMetadata := model.QAMetadata{
		Question: question,
	}

	var liveStreamInfo model.LiveStreamInfo
	storage.RedisClient.Get(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo)

	jstring, err := json.Marshal(qaMetadata)
	body.Metadata["metadata"] = string(jstring)
	request := &lss.MetadataRequest{
		PlayDomain: liveStreamInfo.PlayDomain,
		App:        liveStreamInfo.App,
		Stream:     liveStreamInfo.Stream,
		Metadata:   body,
	}

	credential :=
		bceauth.NewBceCredentials(config.Config.User.AccessKeyId, config.Config.User.SecretAccessKey)
	lssClient, _ := lss.NewClient(credential)
	err = lssClient.AddMetadata(request)
	if err != nil {
		logrus.Errorf("add metadata error, %v\n", err)
	}

	return err
}
