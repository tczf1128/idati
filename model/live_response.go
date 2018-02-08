package model

type LiveResponse struct {
	Success bool        `json:"success"`
	Message interface{} `json:"message,omitempty"`
	Result  interface{} `json:"result,omitempty"`
	Page    interface{} `json:"page,omitempty"`
}

type ErrorMessage struct {
	Global string `json:"global,omitempty"`
}
