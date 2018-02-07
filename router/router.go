package router

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/idati/controller"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	// Disable Console Color
	gin.DisableConsoleColor()

	// gin.SetMode(gin.ReleaseMode)

	r := gin.Default()

	if gin.Mode() != gin.ReleaseMode {
		r.Use(RequestLogger())
	}
	//r.Use(ginrus.Ginrus(logrus.StandardLogger(), time.RFC3339, false), gin.Recovery())

	v1 := r.Group("/api/idati/v1")
	{
		status := new(controller.StatusController)
		v1.POST("/status/detail", status.Get)
		v1.POST("/status/update", status.Set)
		v1.POST("/playUrl/detail", status.GetPlayUrl)
		v1.POST("/playUrl/update", status.UpdatePlayUrl)

		question := new(controller.QuestionController)
		v1.POST("/question/list", question.List)
		v1.POST("/question/detail", question.Detail)
		v1.POST("/question/create", question.Create)
		v1.POST("/question/delete", question.Delete)
		v1.POST("/question/update", question.Update)
		v1.POST("/question/send", question.Send)

		answer := new(controller.AnswerController)
		v1.POST("/question/standardAnswer", answer.SendByAdmin)
		v1.POST("/question/userAnswer", answer.SendByUser)

	}
	//r.Static("/asset", "./fe_source/dist/asset")
	//r.Static("/idati/src/img", "./fe_source/dist/src/common/img")
	//r.StaticFile("cyberplayer.flash.swf", "./fe_source/src/common/cyberplayer/cyberplayer.flash.swf")
	r.Static("/static/css", "./fe_source/dist/static/css")
	r.Static("/static/js", "./fe_source/dist/static/js")
	r.Static("/assets/images", "./fe_source/dist/assets/images")
	r.LoadHTMLFiles("fe_source/dist/index.html")
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{})
	})

	//r.Static("/asset", "./fe_source/output/asset")
	//r.Static("/cdn", "./fe_source/output/cdn")
	//r.Static("/idati/src/img", "./fe_source/output/asset/img")
	//r.StaticFile("cyberplayer.flash.swf", "./fe_source/output/asset/idati/common/cyberplayer/cyberplayer.flash.swf")
	//r.LoadHTMLFiles("fe_source/output/index.html")
	//r.GET("/", func(c *gin.Context) {
	//c.HTML(http.StatusOK, "index.html", gin.H{})
	//})

	return r
}

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		buf, _ := ioutil.ReadAll(c.Request.Body)
		rdr1 := ioutil.NopCloser(bytes.NewBuffer(buf))
		rdr2 := ioutil.NopCloser(bytes.NewBuffer(buf)) //We have to create a new Buffer, because rdr1 will be read.

		fmt.Println(readBody(rdr1)) // Print request body

		c.Request.Body = rdr2
		c.Next()
	}
}

func readBody(reader io.Reader) string {
	buf := new(bytes.Buffer)
	buf.ReadFrom(reader)

	s := buf.String()
	return s
}
