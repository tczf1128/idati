package lss

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)
import (
	"baidubce.com/auth"
	"baidubce.com/httplib"
	"baidubce.com/utils"
)

const (
	DefaultLocation   = "bj"
	DefaultAPIVersion = "v5"
	APIVersionV6      = "v6"
	DefaultHost       = "lss.bj.baidubce.com"
	//DefaultHost = "lss.bce-testinternal.baidu.com"
)

type Client struct {
	Credential *auth.BceCredentials
	Location   string
	APIVersion string
	Host       string
	Debug      bool
}

func NewClient(credential *auth.BceCredentials) (Client, error) {
	return Client{
		Credential: credential,
		Location:   DefaultLocation,
		APIVersion: DefaultAPIVersion,
		Host:       DefaultHost,
		Debug:      false,
	}, nil
}

func (c Client) GetBaseURL() string {
	return fmt.Sprintf("%s/%s", c.GetEndpoint(), c.APIVersion)
}

func (c Client) GetEndpoint() string {
	return fmt.Sprintf("http://%s", c.GetHost())
}

func (c Client) GetHost() string {
	return DefaultHost
}

type ErrorResponse struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestId string `json:"requestId"`
}

func (e ErrorResponse) Error() string {
	return fmt.Sprintf("Service returned error: Code=%s, RequestId=%s, Message=%s", e.Code, e.RequestId, e.Message)
}

func (c Client) doRequest(req *httplib.Request) (*http.Response, error) {
	if req.BaseUrl == "" {
		req.BaseUrl = c.GetBaseURL()
	}
	req.Headers[httplib.HOST] = c.GetHost()

	timestamp := utils.GetHttpHeadTimeStamp()
	auth.Debug = c.Debug
	authorization := auth.Sign(c.Credential, timestamp, req.Method, req.Path, req.Query, req.Headers)

	req.Headers[httplib.BCE_DATE] = timestamp
	req.Headers[httplib.AUTHORIZATION] = authorization

	httplib.Debug = c.Debug
	res, err := httplib.Run(req, nil)
	if err != nil {
		return res, err
	}

	if res.StatusCode != 200 {
		errR := &ErrorResponse{}
		if req.Method == httplib.HEAD || req.Method == httplib.DELETE {
			errR.Code = fmt.Sprintf("%d", res.StatusCode)
			errR.Message = res.Status
			errR.RequestId = "EMPTY"
		} else {
			body, err := ioutil.ReadAll(res.Body)
			if err != nil {
				return res, err
			}
			j := json.NewDecoder(strings.NewReader(string(body)))
			j.Decode(&errR)
		}
		return res, errR
	}
	return res, err
}

type Metadata struct {
	Metadata map[string]string `json:"metadata"`
}

type MetadataRequest struct {
	PlayDomain string   `json:"playDomain"`
	App        string   `json:"app"`
	Stream     string   `json:"stream"`
	Metadata   Metadata `json:"metadata"`
}

type RealTimeStreamStatistic struct {
	Stream    string `json:"stream"`
	PlayCount int64  `json:"playCount"`
}

type RealtimeStreamStatisticsResponse struct {
	RealTimeStreamStatisticsList []RealTimeStreamStatistic `json:"realTimeStreamStatisticsList"`
}

func (c Client) AddMetadata(request *MetadataRequest) error {
	req := &httplib.Request{
		Method:  httplib.PUT,
		Headers: map[string]string{},
		Path:    c.APIVersion + "/domain/" + request.PlayDomain + "/app/" + request.App + "/stream/" + request.Stream,
		Query:   "addMetadata",
	}

	jstring, err := json.Marshal(request.Metadata)
	req.Body = bytes.NewReader(jstring)
	req.Type = httplib.JSON

	res, err := c.doRequest(req)
	if err != nil {
		return err
	}

	//body, err := ioutil.ReadAll(res.Body)
	_, err = ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	//j := json.NewDecoder(strings.NewReader(string(body)))

	return err
}

func (c Client) GetRealtimeStatistics(playDomain, app string) (output RealtimeStreamStatisticsResponse, err error) {
	req := &httplib.Request{
		Method:  httplib.GET,
		Headers: map[string]string{},
		Path:    APIVersionV6 + "/statistics/realtime/domain/" + playDomain + "/app/" + app,
	}

	res, err := c.doRequest(req)
	if err != nil {
		return
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}

	j := json.NewDecoder(strings.NewReader(string(body)))

	j.Decode(&output)

	return
}
