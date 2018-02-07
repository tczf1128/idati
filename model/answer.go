package model

type Answer struct {
	Topic  string `json:"topic" binding:"required"`
	Option string `json:"option" binding:"required"`
}

type SendAnswerRequest struct {
	PlayDomain string `json:"playDomain" binding:"required"`
	App        string `json:"app" binding:"required"`
	Stream     string `json:"stream" binding:"required"`
	Answer     Answer `json:"answer" binding:"required"`
}
