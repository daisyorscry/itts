package mailer

import (
	"crypto/tls"
	"fmt"
	"net"
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
	msg := []byte("To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n" +
		htmlBody + "\r\n")

	client, err := m.newClient(addr)
	if err != nil {
		return fmt.Errorf("smtp connect failed: %w", err)
	}
	defer client.Close()

	if m.User != "" && m.Pass != "" {
		if ok, _ := client.Extension("AUTH"); ok {
			auth := smtp.PlainAuth("", m.User, m.Pass, m.Host)
			if err := client.Auth(auth); err != nil {
				return fmt.Errorf("smtp auth failed: %w", err)
			}
		}
	}

	if err := client.Mail(m.From); err != nil {
		return fmt.Errorf("smtp MAIL FROM failed: %w", err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("smtp RCPT TO failed: %w", err)
	}

	writer, err := client.Data()
	if err != nil {
		return fmt.Errorf("smtp DATA failed: %w", err)
	}
	if _, err := writer.Write(msg); err != nil {
		_ = writer.Close()
		return fmt.Errorf("smtp write failed: %w", err)
	}
	if err := writer.Close(); err != nil {
		return fmt.Errorf("smtp close failed: %w", err)
	}
	if err := client.Quit(); err != nil {
		return fmt.Errorf("smtp quit failed: %w", err)
	}
	return nil
}

func (m *SMTPMailer) newClient(addr string) (*smtp.Client, error) {
	tlsConfig := &tls.Config{
		ServerName:         m.Host,
		InsecureSkipVerify: false,
		MinVersion:         tls.VersionTLS12,
	}

	if m.Port == 465 {
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return nil, err
		}
		return smtp.NewClient(conn, m.Host)
	}

	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return nil, err
	}

	client, err := smtp.NewClient(conn, m.Host)
	if err != nil {
		_ = conn.Close()
		return nil, err
	}

	if ok, _ := client.Extension("STARTTLS"); ok {
		if err := client.StartTLS(tlsConfig); err != nil {
			_ = client.Close()
			return nil, err
		}
	}

	return client, nil
}
