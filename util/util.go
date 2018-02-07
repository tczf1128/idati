package util

import (
	"fmt"
	"net/url"
	"strings"

	"github.com/satori/go.uuid"
	"github.com/sirupsen/logrus"
)

func GenerateFullStream(playDomain, app, stream string) string {
	return fmt.Sprintf("%s-%s-%s", playDomain, app, stream)
}

func GenerateId() string {
	uuid, err := uuid.NewV4()
	if err != nil {
		logrus.Errorf("generate id failed: %s", err)
		return ""
	}

	return uuid.String()
}

// rtmp://domain.baidu.com/app/stream => domain.baidu.com, app, stream
func SplitPlayUrl(playUrl string) (string, string, string) {
	u, err := url.Parse(playUrl)
	if err != nil {
		logrus.Errorf("wrong playUrl %s, err=%v\n", playUrl, err)
		panic(err)
	}
	playDomain := u.Host
	app := strings.Split(u.Path, "/")[1]
	stream := strings.Split(u.Path, "/")[2]

	return playDomain, app, stream
}
