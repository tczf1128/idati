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
					resp.Success = false
					resp.Message = constant.ErrorQuestionSend
					c.JSON(http.StatusOK, resp)
					return
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
			resp.Message = constant.ErrorQuestionNotExist
			c.JSON(http.StatusOK, resp)
		}
	} else {
		logrus.Errorf("send question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ErrorParams
		c.JSON(http.StatusOK, resp)
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

		err = storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList, constant.REDIS_DEFAULT_EXPIRATION)
		if err != nil {
			logrus.Errorf("save error when create question, err=%v", err)
			resp.Success = false
			resp.Message = constant.ErrorQuestionCreate
			c.JSON(http.StatusOK, resp)
			return
		}

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("create question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ErrorParams
		c.JSON(http.StatusOK, resp)
	}
}

func (ctrl *QuestionController) Delete(c *gin.Context) {
	var json model.QuestionIdRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)
		var found bool
		for i, elem := range questionList.Questions {
			if elem.Id == json.Id {
				found = true
				questionList.Questions = append(questionList.Questions[:i], questionList.Questions[i+1:]...)
				break
			}
		}
		if !found {
			resp.Success = false
			resp.Message = constant.ErrorQuestionNotExist
			c.JSON(http.StatusOK, resp)
			return
		}
		err = storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList, constant.REDIS_DEFAULT_EXPIRATION)
		if err != nil {
			logrus.Errorf("save error when delete question, err=%v", err)
			resp.Success = false
			resp.Message = constant.ErrorQuestionDelete
			c.JSON(http.StatusOK, resp)
			return
		}

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("delete question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ErrorParams
		c.JSON(http.StatusOK, resp)
	}
}

func (ctrl *QuestionController) Detail(c *gin.Context) {
	var json model.QuestionIdRequest
	resp := model.LiveResponse{}
	if err := c.BindJSON(&json); err == nil {
		var questionList model.QuestionList
		storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)
		var found bool
		for _, elem := range questionList.Questions {
			if elem.Id == json.Id {
				found = true
				resp.Result = elem
				break
			}
		}

		if !found {
			resp.Success = false
			resp.Message = constant.ErrorQuestionNotExist
			c.JSON(http.StatusOK, resp)
			return
		}

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("query question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ErrorParams
		c.JSON(http.StatusOK, resp)
	}
}

func (ctrl *QuestionController) List(c *gin.Context) {
	var questionList model.QuestionList
	resp := model.LiveResponse{}
	storage.RedisClient.Get(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList)

	listQuestionResponse := model.ListQuestionResponse{
		TotalCount: len(questionList.Questions),
	}
	if len(questionList.Questions) == 0 {
		listQuestionResponse.Result = make([]model.Question, 0)
	} else {
		listQuestionResponse.Result = questionList.Questions
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

		var found bool
		for i, elem := range questionList.Questions {
			if elem.Id == json.Id {
				found = true
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

		if !found {
			resp.Success = false
			resp.Message = constant.ErrorQuestionNotExist
			c.JSON(http.StatusOK, resp)
			return
		}

		err = storage.RedisClient.Set(constant.REDIS_LIVE_QUESTION_LIST_KEY, &questionList, constant.REDIS_DEFAULT_EXPIRATION)
		if err != nil {
			logrus.Errorf("save error when update question, err=%v", err)
			resp.Success = false
			resp.Message = constant.ErrorQuestionUpdate
			c.JSON(http.StatusOK, resp)
			return
		}

		resp.Success = true
		c.JSON(http.StatusOK, resp)
	} else {
		logrus.Errorf("update question error: %v\n", err)
		resp.Success = false
		resp.Message = constant.ErrorParams
		c.JSON(http.StatusOK, resp)
	}
}
