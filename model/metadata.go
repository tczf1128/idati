package model

type Metadata struct {
	Metadata map[string]string
}

type MetadataRequest struct {
	PlayDomain string   `json:"playDomain"`
	App        string   `json:"app"`
	Stream     string   `json:"stream"`
	Metadata   Metadata `json:"metadata"`
}

type QAMetadata struct {
	Question        Question         `json:"question" binding:"required"`
	StandardAnswer  string           `json:"standardAnswer"`
	UserAnswerCount map[string]int64 `json:"userAnswerCount"`
}
