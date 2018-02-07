package controller

import (
	"net/http"

	bceauth "baidubce.com/auth"
	"baidubce.com/service/lss"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"github.com/idati/config"
	"github.com/idati/constant"
	"github.com/idati/model"
	"github.com/idati/storage"
	"github.com/idati/util"
)

type StatusController struct{}

func (ctrl *StatusController) Get(c *gin.Context) {
	var json model.GetStatusRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var playCount int64 = 0
		var liveStreamInfo model.LiveStreamInfo
		storage.RedisClient.Get(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo)

		logrus.Debug("load liveStreamInfo=%v", liveStreamInfo)
		if liveStreamInfo.PlayDomain != json.PlayDomain || liveStreamInfo.App != json.App || liveStreamInfo.Stream != json.Stream {
			logrus.Error("no such domain/app/stream")
			resp.Success = false
			resp.Message = constant.ERROR_MESSAGE_UNKNOWN
			c.JSON(http.StatusBadRequest, resp)
		}

		if liveStreamInfo.Status == 1 {
			credential :=
				bceauth.NewBceCredentials(config.Config.User.AccessKeyId, config.Config.User.SecretAccessKey)
			lssClient, _ := lss.NewClient(credential)
			statisticsResp, err := lssClient.GetRealtimeStatistics(json.PlayDomain, json.App)
			for _, st := range statisticsResp.RealTimeStreamStatisticsList {
				if st.Stream == json.Stream {
					playCount = st.PlayCount
					break
				}
			}
			if err != nil {
				logrus.Errorf("get stream playcount error, err=%v\n", err)
				resp.Success = false
				resp.Message = constant.ERROR_MESSAGE_UNKNOWN
				c.JSON(http.StatusBadRequest, resp)
			}
		}

		resp.Success = true
		resp.Result = model.LiveStatus{liveStreamInfo.Status, playCount}
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("get status error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_BAD_REQUEST
		c.JSON(http.StatusBadRequest, resp)
	}
}

func (ctrl *StatusController) Set(c *gin.Context) {
	var json model.SetStatusRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var liveStreamInfo model.LiveStreamInfo
		storage.RedisClient.Get(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo)
		liveStreamInfo.Status = json.Status
		err = storage.RedisClient.Set(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo, constant.REDIS_DEFAULT_EXPIRATION)

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("set status error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_BAD_REQUEST
		c.JSON(http.StatusBadRequest, resp)
	}
}

func (ctrl *StatusController) UpdatePlayUrl(c *gin.Context) {
	var json model.UpdatePlayUrlRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var liveStreamInfo model.LiveStreamInfo
		liveStreamInfo.PlayUrl = json.PlayUrl
		liveStreamInfo.PlayDomain, liveStreamInfo.App, liveStreamInfo.Stream = util.SplitPlayUrl(json.PlayUrl)
		logrus.Debug("updated liveStreamInfo=%v\n", liveStreamInfo)
		err = storage.RedisClient.Set(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo, constant.REDIS_DEFAULT_EXPIRATION)

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("update play url error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_BAD_REQUEST
		c.JSON(http.StatusBadRequest, resp)
	}
}

func (ctrl *StatusController) GetPlayUrl(c *gin.Context) {
	resp := model.LiveResponse{}

	var liveStreamInfo model.LiveStreamInfo
	err := storage.RedisClient.Get(constant.REDIS_LIVE_STREAM_INFO_KEY, &liveStreamInfo)
	if err != nil {
		logrus.Errorf("load liveStreamInfo error, err=%v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_BAD_REQUEST
		c.JSON(http.StatusBadRequest, resp)
	}
	resp.Success = true
	resp.Result = liveStreamInfo
	c.JSON(http.StatusOK, resp)
}
