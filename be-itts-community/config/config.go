package config

import (
	"log"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
    AppName        string
    AppEnv         string
    AppPort        string
    Prefork        bool
    Workers        int
    VerifyEmailURL string

	DB struct {
		Host     string
		Port     string
		User     string
		Password string
		Name     string
		SSLMode  string
		Timezone string
	}

    Mail struct {
        Host     string
        Port     int
        User     string
        Password string
        From     string
    }

    LogLevel string

    Redis struct {
        Addr     string
        DB       int
        Password string
    }

    NewRelic struct {
        Enabled  bool
        AppName  string
        License  string
    }

    JWT struct {
        Secret            string
        AccessDuration    string
        RefreshDuration   string
        Issuer            string
    }

    OAuth struct {
        GitHub struct {
            ClientID      string
            ClientSecret  string
            RedirectURI   string
        }
    }
}

func LoadConfig() *Config {
	viper.SetConfigFile(".env")
	viper.SetConfigType("env")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("error loading config: %v", err)
	}

	cfg := &Config{}
	cfg.AppName = viper.GetString("APP_NAME")
	cfg.AppEnv = viper.GetString("APP_ENV")
	cfg.AppPort = viper.GetString("APP_PORT")
	cfg.Prefork = viper.GetBool("APP_PREFORK")
	cfg.Workers = viper.GetInt("APP_WORKERS")
	cfg.VerifyEmailURL = viper.GetString("VERIFY_EMAIL_URL")

	cfg.DB.Host = viper.GetString("DB_HOST")
	cfg.DB.Port = viper.GetString("DB_PORT")
	cfg.DB.User = viper.GetString("DB_USER")
	cfg.DB.Password = viper.GetString("DB_PASSWORD")
	cfg.DB.Name = viper.GetString("DB_NAME")
	cfg.DB.SSLMode = viper.GetString("DB_SSLMODE")
	cfg.DB.Timezone = viper.GetString("DB_TIMEZONE")

	cfg.Mail.Host = viper.GetString("MAIL_HOST")
	cfg.Mail.Port = viper.GetInt("MAIL_PORT")
	cfg.Mail.User = viper.GetString("MAIL_USER")
	cfg.Mail.Password = viper.GetString("MAIL_PASSWORD")
	cfg.Mail.From = viper.GetString("MAIL_FROM")

    cfg.LogLevel = viper.GetString("LOG_LEVEL")

    cfg.Redis.Addr = viper.GetString("REDIS_ADDR")
    cfg.Redis.DB = viper.GetInt("REDIS_DB")
    cfg.Redis.Password = viper.GetString("REDIS_PASSWORD")

    cfg.NewRelic.Enabled = viper.GetBool("NEW_RELIC_ENABLED")
    cfg.NewRelic.AppName = viper.GetString("NEW_RELIC_APP_NAME")
    cfg.NewRelic.License = viper.GetString("NEW_RELIC_LICENSE_KEY")

    cfg.JWT.Secret = viper.GetString("JWT_SECRET")
    cfg.JWT.AccessDuration = viper.GetString("JWT_ACCESS_DURATION")
    cfg.JWT.RefreshDuration = viper.GetString("JWT_REFRESH_DURATION")
    cfg.JWT.Issuer = viper.GetString("JWT_ISSUER")

    cfg.OAuth.GitHub.ClientID = viper.GetString("GITHUB_CLIENT_ID")
    cfg.OAuth.GitHub.ClientSecret = viper.GetString("GITHUB_CLIENT_SECRET")
    cfg.OAuth.GitHub.RedirectURI = viper.GetString("GITHUB_REDIRECT_URI")

    return cfg
}
