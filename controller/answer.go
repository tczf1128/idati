package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"github.com/idati/constant"
	"github.com/idati/model"
	"github.com/idati/service"
	"github.com/idati/storage"
)

type AnswerController struct{}

func (ctrl *AnswerController) SendByUser(c *gin.Context) {
	var json model.SendAnswerRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		storage.IncrementAnswerCount(json)
		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("send answer by user error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ErrorParams
		c.JSON(http.StatusOK, resp)
	}
}

func (ctrl *AnswerController) SendByAdmin(c *gin.Context) {
	var json model.QuestionIdRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {

		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)

		var found bool
		var countMap map[string]int64
		for i, elem := range questionList.Questions {
			if elem.Id == json.Id {
				found = true
				storage.RedisClient.Get(elem.Topic, &countMap)

				err = service.SendAnswer(elem)
				if err == nil {
					questionList.Questions[i].Status = constant.QUESTION_STATUS_FINISHED
					storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY,
						&questionList, constant.REDIS_DEFAULT_EXPIRATION)
				}
				break
			}
		}

		if found && err == nil {
			resp.Success = true
			resp.Result = struct {
				UserAnswerCount map[string]int64 `json:"userAnswerCount"`
			}{
				countMap,
			}
			c.JSON(http.StatusOK, resp)
		} else {
			logrus.Errorf("question not found or error, questionId=%s, err=%v\n", json.Id, err)
			resp.Success = false
			resp.Message = constant.ErrorQuestionNotExist
			c.JSON(http.StatusOK, resp)
		}
	} else {
		logrus.Errorf("send answer by admin error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ErrorParams
		c.JSON(http.StatusOK, resp)
	}
}
