package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"

	"github.com/idati/constant"
	"github.com/idati/model"
	"github.com/idati/service"
	"github.com/idati/storage"
	"github.com/idati/util"
)

type QuestionController struct{}

func (ctrl *QuestionController) Send(c *gin.Context) {
	var json model.QuestionIdRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)

		found := false
		for i, elem := range questionList.Questions {
			if elem.Id == json.Id {
				found = true
				err = service.SendQuestion(elem)
				if err == nil {
					questionList.Questions[i].Status = constant.QUESTION_STATUS_PROCESSING
					storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY,
						&questionList, constant.REDIS_DEFAULT_EXPIRATION)
				} else {
					logrus.Error("send question error")
				}
				break
			}
		}

		if found && err == nil {
			resp.Success = true
			c.JSON(http.StatusOK, resp)
		} else {
			logrus.Errorf("question not found or error, questionId=%s, err=%v\n", json.Id, err)
			resp.Success = false
			resp.Message = constant.ERROR_MESSAGE_QUESTION_NOT_EXIST
			c.JSON(http.StatusBadRequest, resp)
		}
	} else {
		logrus.Errorf("send question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_BAD_REQUEST
		c.JSON(http.StatusBadRequest, resp)
	}
}

func (ctrl *QuestionController) Create(c *gin.Context) {
	var json model.CreateQuestionRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)
		newQuestion := model.Question{
			Id:      util.GenerateId(),
			Topic:   json.Topic,
			Options: json.Options,
			Answer:  json.Answer,
			Status:  constant.QUESTION_STATUS_UNBDEGIN,
		}
		questionList.Questions = append(questionList.Questions, newQuestion)

		storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList, constant.REDIS_DEFAULT_EXPIRATION)

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("create question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_CREATE_QUESTION
		c.JSON(http.StatusBadRequest, resp)
	}
}

func (ctrl *QuestionController) Delete(c *gin.Context) {
	var json model.QuestionIdRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)
		for i, elem := range questionList.Questions {
			if elem.Id == json.Id {
				questionList.Questions = append(questionList.Questions[:i], questionList.Questions[i+1:]...)
				break
			}
		}
		storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList, constant.REDIS_DEFAULT_EXPIRATION)

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("delete question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_DELETE_QUESTION
		c.JSON(http.StatusBadRequest, resp)
	}
}

func (ctrl *QuestionController) Detail(c *gin.Context) {
	var json model.QuestionIdRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)
		for _, elem := range questionList.Questions {
			if elem.Id == json.Id {
				resp.Result = elem
				break
			}
		}

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("query question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_QUERY_QUESTION
		c.JSON(http.StatusBadRequest, resp)
	}
}

func (ctrl *QuestionController) List(c *gin.Context) {
	var questionList model.QuestionList
	resp := model.LiveResponse{}
	storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)

	listQuestionResponse := model.ListQuestionResponse{
		TotalCount: len(questionList.Questions),
		Result:     questionList.Questions,
	}
	resp.Success = true
	resp.Page = listQuestionResponse
	c.JSON(http.StatusOK, resp)
}

func (ctrl *QuestionController) Update(c *gin.Context) {
	var json model.UpdateQuestionRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)
		for i, elem := range questionList.Questions {
			if elem.Id == json.Id {
				updatedQuestion := model.Question{
					Id:      elem.Id,
					Topic:   json.Topic,
					Options: json.Options,
					Answer:  json.Answer,
					Status:  constant.QUESTION_STATUS_UNBDEGIN,
				}
				questionList.Questions[i] = updatedQuestion
				break
			}
		}

		storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList, constant.REDIS_DEFAULT_EXPIRATION)

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("update question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ERROR_MESSAGE_UPDATE_QUESTION
		c.JSON(http.StatusBadRequest, resp)
	}
}
