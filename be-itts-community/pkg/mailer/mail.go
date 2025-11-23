package mailer

type Mailer interface {
    Send(to, subject, htmlBody string) error
}

