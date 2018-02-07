package log

import (
	"io"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func LogInit(logfile, logLevel string) {
	file, err := os.OpenFile(logfile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		logrus.SetOutput(file)
	} else {
		logrus.Info("Failed to log to file, using default stderr")
	}

	if gin.Mode() != gin.ReleaseMode {
		gin.DefaultWriter = io.MultiWriter(file, os.Stdout)
		gin.DefaultErrorWriter = io.MultiWriter(file, os.Stderr)
	} else {
		gin.DefaultWriter = io.MultiWriter(file)
		gin.DefaultErrorWriter = io.MultiWriter(file)
	}

	logrus.WithFields(logrus.Fields{
		"filename": "idati.log",
	}).Info("log init")

	logrus.SetFormatter(&logrus.TextFormatter{
		TimestampFormat: time.RFC3339,
		DisableColors:   false})

	switch {
	case logLevel == "debug":
		logrus.SetLevel(logrus.DebugLevel)
	case logLevel == "fatal":
		logrus.SetLevel(logrus.FatalLevel)
	case logLevel == "error":
		logrus.SetLevel(logrus.ErrorLevel)
	case logLevel == "info":
		logrus.SetLevel(logrus.InfoLevel)
	case logLevel == "warn":
		logrus.SetLevel(logrus.WarnLevel)
	case logLevel == "panic":
		logrus.SetLevel(logrus.PanicLevel)
	default:
		logrus.SetLevel(logrus.InfoLevel)
	}
	logrus.WithFields(logrus.Fields{
		"filename": "idati.log",
	}).Info("log init complete")

}
