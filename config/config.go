package config

var Config = struct {
	User struct {
		AccessKeyId     string
		SecretAccessKey string
	}

	Storage struct {
		Redis struct {
			Host              string
			Password          string
			DefaultExpiration string
		}
	}

	Log struct {
		File string
	}

	Live struct {
		PlayUrl string
	}

	Listen string
}{}
