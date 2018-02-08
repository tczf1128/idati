package model

type Question struct {
	Id      string   `json:"id,omitempty"`
	Topic   string   `json:"topic,omitempty" binding:"required"`
	Options []string `json:"options,omitempty" binding:"required"`
	Answer  string   `json:"answer,omitempty" binding:"required"`
	Status  string   `json:"status,omitempty"`
}

type QuestionList struct {
	Questions []Question `json:"questions"`
}

type CreateQuestionRequest struct {
	Topic   string   `json:"topic" binding:"required"`
	Options []string `json:"options" binding:"required"`
	Answer  string   `json:"answer" binding:"required"`
}

type UpdateQuestionRequest struct {
	Id      string   `json:"id" binding:"required"`
	Topic   string   `json:"topic" binding:"required"`
	Options []string `json:"options" binding:"required"`
	Answer  string   `json:"answer" binding:"required"`
}

type ListQuestionResponse struct {
	TotalCount int        `json:"totalCount"`
	Result     []Question `json:"result"`
}

type QuestionIdRequest struct {
	Id string `json:"id" binding:"required"`
}
