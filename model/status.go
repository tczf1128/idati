package model

type LiveStatus struct {
	Status    int   `json:"status"`
	PlayCount int64 `json:"playCount"`
}

type GetStatusRequest struct {
	PlayDomain string `json:"playDomain" binding:"required"`
	App        string `json:"app" binding:"required"`
	Stream     string `json:"stream" binding:"required"`
}

type SetStatusRequest struct {
	PlayDomain string `json:"playDomain" binding:"required"`
	App        string `json:"app" binding:"required"`
	Stream     string `json:"stream" binding:"required"`
	Status     int    `json:"status" binging:"required"`
}

type LiveStreamInfo struct {
	Status     int    `json:"status"`
	PlayUrl    string `json:"playUrl"`
	PlayDomain string `json:"playDomain"`
	App        string `json:"app"`
	Stream     string `json:"stream"`
	// current question
	Question Question `json:"question"`
}

type UpdatePlayUrlRequest struct {
	PlayUrl string `json:"playUrl" binging:"required"`
}
