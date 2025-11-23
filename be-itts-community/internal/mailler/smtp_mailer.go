package mailer

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
)

type SMTPMailer struct {
	Host string
	Port int
	User string
	Pass string
	From string
}

func NewSMTPMailer(host string, port int, user, pass, from string) *SMTPMailer {
	return &SMTPMailer{Host: host, Port: port, User: user, Pass: pass, From: from}
}

func (m *SMTPMailer) Send(to, subject, htmlBody string) error {
	addr := fmt.Sprintf("%s:%d", m.Host, m.Port)
	auth := smtp.PlainAuth("", m.User, m.Pass, m.Host)

	msg := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n" +
		htmlBody + "\r\n")

	tlsconfig := &tls.Config{InsecureSkipVerify: true, ServerName: m.Host}

	conn, err := tls.Dial("tcp", addr, tlsconfig)
	if err != nil {
		return err
	}
	c, err := smtp.NewClient(conn, m.Host)
	if err != nil {
		return err
	}
	defer c.Quit()

	if err = c.Auth(auth); err != nil {
		return err
	}
	if err = c.Mail(m.From); err != nil {
		return err
	}
	if err = c.Rcpt(to); err != nil {
		return err
	}
	w, err := c.Data()
	if err != nil {
		return err
	}
	if _, err = w.Write(msg); err != nil {
		return err
	}
	return w.Close()
}
