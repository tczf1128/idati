package main

import (
	"github.com/gin-gonic/contrib/cache"
	"github.com/jinzhu/configor"
	"github.com/sirupsen/logrus"

	"github.com/idati/config"
	"github.com/idati/constant"
	"github.com/idati/log"
	"github.com/idati/model"
	"github.com/idati/router"
	"github.com/idati/storage"
	"github.com/idati/util"
)

func init() {
	configor.Load(&config.Config, "config.yml")
	storage.RedisClient = cache.NewRedisCache(config.Config.Storage.Redis.Host,
		config.Config.Storage.Redis.Password, 6000)

	log.LogInit(config.Config.Log.File, "debug")

	initLiveStreamInfo()
}

func initLiveStreamInfo() {
	var liveStreamInfo model.LiveStreamInfo
	err := storage.RedisClient.Get(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo)
	if err != nil {
		logrus.Debug("liveStreamInfo not exist in storage, init it")
		liveStreamInfo.PlayUrl = config.Config.Live.PlayUrl
		liveStreamInfo.PlayDomain, liveStreamInfo.App, liveStreamInfo.Stream = util.SplitPlayUrl(liveStreamInfo.PlayUrl)
		logrus.Debug("init liveStreamInfo=%v\n", liveStreamInfo)
		err := storage.RedisClient.Set(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo, constant.REDIS_DEFAULT_EXPIRATION)
		if err != nil {
			logrus.Error("init liveStreamInfo error")
		}
	}
}

func main() {
	r := router.SetupRouter()

	listenAddr := ":" + config.Config.Listen
	r.Run(listenAddr)
}
