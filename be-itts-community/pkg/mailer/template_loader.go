package mailer

import (
	"bytes"
	"fmt"
	"html/template"
	"path/filepath"
	"sync"
)

var (
	templates     *template.Template
	templatesOnce sync.Once
	templatesErr  error
)

// TemplateData holds common data for email templates
type TemplateData struct {
	FullName         string
	Program          string
	Email            string
	VerifyLink       string
	ResumeLink       string
	EventTitle       string
	EventSummary     string
	EventVenue       string
	EventDate        string
	Status           string
	Reason           string
	PaymentLink      string
	PaymentReference string
	Amount           string
	Currency         string
}

// initTemplates loads all email templates once
func initTemplates() {
	templatesOnce.Do(func() {
		templateDir := filepath.Join("templates", "email")
		templates, templatesErr = template.ParseGlob(filepath.Join(templateDir, "*.html"))
	})
}

// RenderTemplate renders an email template with the given data
func RenderTemplate(templateName string, data TemplateData) (string, error) {
	initTemplates()
	if templatesErr != nil {
		return "", fmt.Errorf("failed to load templates: %w", templatesErr)
	}

	var buf bytes.Buffer
	if err := templates.ExecuteTemplate(&buf, templateName, data); err != nil {
		return "", fmt.Errorf("failed to execute template %s: %w", templateName, err)
	}

	return buf.String(), nil
}

// RenderVerificationEmail renders the verification email template
func RenderVerificationEmail(fullName, program, verifyLink string) (string, error) {
	return RenderTemplate("verification.html", TemplateData{
		FullName:   fullName,
		Program:    program,
		VerifyLink: verifyLink,
	})
}

// RenderThankYouEmail renders the thank you email template
func RenderThankYouEmail(fullName, program string) (string, error) {
	return RenderTemplate("thankyou.html", TemplateData{
		FullName: fullName,
		Program:  program,
	})
}

// RenderApprovalEmail renders the approval email template
func RenderApprovalEmail(fullName, program, email string) (string, error) {
	return RenderTemplate("approval.html", TemplateData{
		FullName: fullName,
		Program:  program,
		Email:    email,
	})
}

func RenderEventStatusEmail(fullName, eventTitle, status, reason string) (string, error) {
	return RenderTemplate("event-status.html", TemplateData{
		FullName:   fullName,
		EventTitle: eventTitle,
		Status:     status,
		Reason:     reason,
	})
}

func RenderEventVerificationEmail(fullName, eventTitle, eventSummary, eventVenue, eventDate, verifyLink string) (string, error) {
	return RenderTemplate("event-verification.html", TemplateData{
		FullName:     fullName,
		EventTitle:   eventTitle,
		EventSummary: eventSummary,
		EventVenue:   eventVenue,
		EventDate:    eventDate,
		VerifyLink:   verifyLink,
	})
}

func RenderEventInvoiceEmail(fullName, eventTitle, eventVenue, eventDate, amount, currency, paymentReference, resumeLink string) (string, error) {
	return RenderTemplate("event-invoice.html", TemplateData{
		FullName:         fullName,
		EventTitle:       eventTitle,
		EventVenue:       eventVenue,
		EventDate:        eventDate,
		Amount:           amount,
		Currency:         currency,
		PaymentReference: paymentReference,
		ResumeLink:       resumeLink,
	})
}
