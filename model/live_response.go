package model

type LiveResponse struct {
	Code    int         `json:"code,omitempty"`
	Success bool        `json:"success,omitempty"`
	Message string      `json:"message,omitempty"`
	Result  interface{} `json:"result,omitempty"`
	Page    interface{} `json:"page,omitempty"`
}
