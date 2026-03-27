package rest

import (
	"bytes"
	"crypto/sha256"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"

	"github.com/daisyorscry/itts/core"
)

type EventHandler struct {
	svc         service.EventService
	speakerSvc  service.EventSpeakerService
	registerSvc service.EventRegistrationService
}

func NewEventHandler(eventSvc service.EventService, speakerSvc service.EventSpeakerService, regSvc service.EventRegistrationService) *EventHandler {
	return &EventHandler{svc: eventSvc, speakerSvc: speakerSvc, registerSvc: regSvc}

}

func withAbsoluteEventImageURL(r *http.Request, event model.EventResponse) model.EventResponse {
	if event.FilePath == "" && isAssetPath(event.ImageURL) {
		event.FilePath = event.ImageURL
	}
	if event.ImageURL != "" {
		event.ImageURL = buildAbsoluteAssetURL(r, event.ImageURL)
	}
	if event.SquareFilePath == "" && isAssetPath(event.SquareImageURL) {
		event.SquareFilePath = event.SquareImageURL
	}
	if event.SquareImageURL != "" {
		event.SquareImageURL = buildAbsoluteAssetURL(r, event.SquareImageURL)
	}
	if event.LandscapeFilePath == "" && isAssetPath(event.LandscapeImageURL) {
		event.LandscapeFilePath = event.LandscapeImageURL
	}
	if event.LandscapeImageURL != "" {
		event.LandscapeImageURL = buildAbsoluteAssetURL(r, event.LandscapeImageURL)
	}
	for idx := range event.Speakers {
		event.Speakers[idx] = withAbsoluteSpeakerAvatarURL(r, event.Speakers[idx])
	}
	return event
}

func withAbsoluteEventListImageURL(r *http.Request, list model.EventListResponse) model.EventListResponse {
	for idx := range list.Data {
		list.Data[idx] = withAbsoluteEventImageURL(r, list.Data[idx])
	}
	return list
}

func withAbsoluteRegistrationEventImageURL(r *http.Request, reg model.EventRegistrationResponse) model.EventRegistrationResponse {
	if reg.EventImageURL != "" {
		reg.EventImageURL = buildAbsoluteAssetURL(r, reg.EventImageURL)
	}
	return reg
}

func withAbsoluteSpeakerAvatarURL(r *http.Request, speaker model.SpeakerResponse) model.SpeakerResponse {
	if speaker.AvatarURL != "" {
		speaker.AvatarURL = buildAbsoluteAssetURL(r, speaker.AvatarURL)
	}
	return speaker
}

func withAbsoluteSpeakerListAvatarURL(r *http.Request, list model.SpeakerListResponse) model.SpeakerListResponse {
	for idx := range list.Data {
		list.Data[idx] = withAbsoluteSpeakerAvatarURL(r, list.Data[idx])
	}
	return list
}

// POST /api/v1/admin/events
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var req model.CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	ev, err := h.svc.Create(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, withAbsoluteEventImageURL(r, ev))
}

// GET /api/v1/admin/events/:id
func (h *EventHandler) GetEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ev, err := h.svc.Get(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteEventImageURL(r, ev))
}

// GET /api/v1/events/slug/:slug  (public)
func (h *EventHandler) GetEventBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	ev, err := h.svc.GetBySlug(r.Context(), slug)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteEventImageURL(r, ev))
}

// PATCH /api/v1/admin/events/:id
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	ev, err := h.svc.Update(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteEventImageURL(r, ev))
}

// DELETE /api/v1/admin/events/:id
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Delete(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

// GET /api/v1/admin/events
// Query: search, program, status, from, to, sort, page, page_size
func (h *EventHandler) ListEvents(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	if v := q.Get("program"); v != "" {
		lp.Filters["program"] = v
	}
	if v := q.Get("status"); v != "" {
		lp.Filters["status"] = v
	}
	if v := q.Get("from"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			lp.Filters["starts_at_gte"] = t
		}
	}
	if v := q.Get("to"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			lp.Filters["starts_at_lte"] = t
		}
	}

	res, err := h.svc.List(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteEventListImageURL(r, res))
}

func (h *EventHandler) SetEventStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Status == "" {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req := model.SetEventStatusRequest{
		ID:     id,
		Status: model.EventStatus(body.Status),
	}
	ev, err := h.svc.SetStatus(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, ev)
}

func (h *EventHandler) AddSpeaker(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "event_id")
	var req model.CreateSpeakerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.EventID = eventID
	sp, err := h.speakerSvc.Create(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, withAbsoluteSpeakerAvatarURL(r, sp))
}

func (h *EventHandler) UpdateSpeaker(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateSpeakerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	sp, err := h.speakerSvc.Update(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteSpeakerAvatarURL(r, sp))
}

func (h *EventHandler) DeleteSpeaker(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.speakerSvc.Delete(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

func (h *EventHandler) ListSpeakers(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if evID := chi.URLParam(r, "event_id"); evID != "" {
		lp.Filters["event_id"] = evID
	}
	if v := q.Get("event_id"); v != "" {
		lp.Filters["event_id"] = v
	}
	res, err := h.speakerSvc.List(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteSpeakerListAvatarURL(r, res))
}

/* ======================
   Registrations
   ====================== */

// POST /api/v1/events/:event_id/register (public)
func (h *EventHandler) RegisterToEvent(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "event_id")
	var req model.CreateEventRegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.EventID = eventID
	reg, err := h.registerSvc.Register(r.Context(), req, h.resolveVerifyRegistrationURL(r))
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, map[string]any{
		"id":      reg.ID,
		"email":   reg.Email,
		"status":  reg.Status,
		"message": "Registration received. Please verify your email to continue.",
	})
}

func (h *EventHandler) VerifyRegistration(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	reg, err := h.registerSvc.VerifyRegistration(r.Context(), token)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteRegistrationEventImageURL(r, reg))
}

func (h *EventHandler) CreateRegistrationPayment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.CreateEventRegistrationPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	reg, err := h.registerSvc.CreatePayment(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteRegistrationEventImageURL(r, reg))
}

func (h *EventHandler) GetPublicRegistration(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	reg, err := h.registerSvc.AdminGet(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteRegistrationEventImageURL(r, reg))
}

func (h *EventHandler) GetPublicRegistrationByToken(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	reg, err := h.registerSvc.PublicGetByAccessToken(r.Context(), token)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteRegistrationEventImageURL(r, reg))
}

func (h *EventHandler) ResendRegistrationVerification(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	if err := h.registerSvc.ResendVerification(r.Context(), token, h.resolveVerifyRegistrationURL(r)); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, map[string]any{"message": "Verification email sent"})
}

func (h *EventHandler) ResendRegistrationInvoice(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	if err := h.registerSvc.ResendInvoice(r.Context(), token); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, map[string]any{"message": "Invoice email sent"})
}

func (h *EventHandler) DownloadRegistrationInvoicePDF(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	reg, err := h.registerSvc.PublicGetByAccessToken(r.Context(), token)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	pdfBytes := buildInvoicePDF(reg)
	filename := "invoice-" + strings.ToLower(reg.TicketCode) + ".pdf"
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", `attachment; filename="`+filename+`"`)
	w.Header().Set("Content-Length", strconv.Itoa(len(pdfBytes)))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(pdfBytes)
}

func (h *EventHandler) RegistrationTicketQRCode(w http.ResponseWriter, r *http.Request) {
	token := strings.TrimSpace(r.URL.Query().Get("token"))
	reg, err := h.registerSvc.PublicGetByAccessToken(r.Context(), token)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	content := h.resolveTicketAccessURL(r, token, reg.ID)
	svg := buildTicketSVG(content)
	w.Header().Set("Content-Type", "image/svg+xml")
	w.Header().Set("Content-Length", strconv.Itoa(len(svg)))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(svg))
}

func (h *EventHandler) HandlePaymentWebhook(w http.ResponseWriter, r *http.Request) {
	var req model.EventPaymentWebhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	res, err := h.registerSvc.HandlePaymentWebhook(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, res)
}

func (h *EventHandler) ListRegistrations(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if v := q.Get("event_id"); v != "" {
		lp.Filters["event_id"] = v
	}
	if v := q.Get("email"); v != "" {
		lp.Filters["email"] = v
	}
	if v := q.Get("status"); v != "" {
		lp.Filters["status"] = v
	}
	res, err := h.registerSvc.AdminList(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, res)
}

func (h *EventHandler) GetRegistration(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	reg, err := h.registerSvc.AdminGet(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, reg)
}

func (h *EventHandler) ListRegistrationActivities(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	activities, err := h.registerSvc.AdminActivities(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, activities)
}

func (h *EventHandler) ApproveRegistration(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())
	id := chi.URLParam(r, "id")
	reg, err := h.registerSvc.AdminApprove(r.Context(), authCtx.UserID, id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, reg)
}

func (h *EventHandler) RejectRegistration(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())
	id := chi.URLParam(r, "id")
	var body struct {
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	reg, err := h.registerSvc.AdminReject(r.Context(), authCtx.UserID, id, strings.TrimSpace(body.Reason))
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, reg)
}

func (h *EventHandler) WaitlistRegistration(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())
	id := chi.URLParam(r, "id")
	reg, err := h.registerSvc.AdminWaitlist(r.Context(), authCtx.UserID, id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, reg)
}

func (h *EventHandler) PromoteRegistration(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())
	id := chi.URLParam(r, "id")
	reg, err := h.registerSvc.AdminPromote(r.Context(), authCtx.UserID, id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, reg)
}

func (h *EventHandler) Unregister(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.registerSvc.AdminDelete(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

func (h *EventHandler) resolveVerifyRegistrationURL(r *http.Request) string {
	requestOrigin := strings.TrimSpace(r.Header.Get("Origin"))
	if requestOrigin == "" {
		if referer := strings.TrimSpace(r.Referer()); referer != "" {
			if parsedReferer, err := url.Parse(referer); err == nil && parsedReferer.Scheme != "" && parsedReferer.Host != "" {
				requestOrigin = parsedReferer.Scheme + "://" + parsedReferer.Host
			}
		}
	}
	if requestOrigin == "" {
		return ""
	}

	parsedOrigin, err := url.Parse(requestOrigin)
	if err != nil || parsedOrigin.Scheme == "" || parsedOrigin.Host == "" {
		return ""
	}

	parsedOrigin.Path = "/events/verify-registration"
	parsedOrigin.RawPath = ""
	parsedOrigin.RawQuery = ""
	parsedOrigin.Fragment = ""
	return parsedOrigin.String()
}

func (h *EventHandler) resolveTicketAccessURL(r *http.Request, token string, registrationID string) string {
	requestOrigin := strings.TrimSpace(r.Header.Get("Origin"))
	if requestOrigin == "" {
		if referer := strings.TrimSpace(r.Referer()); referer != "" {
			if parsedReferer, err := url.Parse(referer); err == nil && parsedReferer.Scheme != "" && parsedReferer.Host != "" {
				requestOrigin = parsedReferer.Scheme + "://" + parsedReferer.Host
			}
		}
	}
	if requestOrigin == "" {
		scheme := "http"
		if forwardedProto := strings.TrimSpace(r.Header.Get("X-Forwarded-Proto")); forwardedProto != "" {
			scheme = forwardedProto
		} else if r.TLS != nil {
			scheme = "https"
		}
		host := strings.TrimSpace(r.Header.Get("X-Forwarded-Host"))
		if host == "" {
			host = r.Host
		}
		if host != "" {
			requestOrigin = scheme + "://" + host
		}
	}
	if requestOrigin == "" {
		return ""
	}

	parsedOrigin, err := url.Parse(requestOrigin)
	if err != nil || parsedOrigin.Scheme == "" || parsedOrigin.Host == "" {
		return ""
	}

	parsedOrigin.Path = "/events/payment-resume"
	values := url.Values{}
	if token != "" {
		values.Set("token", token)
	} else if registrationID != "" {
		values.Set("registration_id", registrationID)
	}
	parsedOrigin.RawQuery = values.Encode()
	parsedOrigin.Fragment = ""
	return parsedOrigin.String()
}

func buildInvoicePDF(reg model.EventRegistrationResponse) []byte {
	lines := []string{
		"ITTS EVENT INVOICE",
		"",
		"Ticket Code: " + reg.TicketCode,
		"Reference: " + fallbackString(reg.PaymentReference, "-"),
		"Registrant: " + reg.FullName,
		"Email: " + reg.Email,
		"Event: " + fallbackString(reg.EventTitle, reg.EventID),
		"Venue: " + fallbackString(reg.EventVenue, "TBA"),
		"Schedule: " + formatInvoiceDateRange(reg.EventStartsAt, reg.EventEndsAt),
		"Amount: " + formatInvoiceMoney(reg.EventCurrency, reg.EventPrice, reg.EventIsPaid),
		"Registration Status: " + strings.ReplaceAll(string(reg.Status), "_", " "),
		"Payment Status: " + strings.ReplaceAll(string(reg.PaymentStatus), "_", " "),
	}

	content := buildPDFTextContent(lines)
	var buf bytes.Buffer
	buf.WriteString("%PDF-1.4\n")

	offsets := make([]int, 0, 5)
	writeObj := func(id int, body string) {
		offsets = append(offsets, buf.Len())
		buf.WriteString(strconv.Itoa(id))
		buf.WriteString(" 0 obj\n")
		buf.WriteString(body)
		buf.WriteString("\nendobj\n")
	}

	writeObj(1, "<< /Type /Catalog /Pages 2 0 R >>")
	writeObj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
	writeObj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>")
	writeObj(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
	writeObj(5, "<< /Length "+strconv.Itoa(len(content))+" >>\nstream\n"+content+"\nendstream")

	xrefPos := buf.Len()
	buf.WriteString("xref\n0 6\n")
	buf.WriteString("0000000000 65535 f \n")
	for _, offset := range offsets {
		buf.WriteString(fmt.Sprintf("%010d 00000 n \n", offset))
	}
	buf.WriteString("trailer << /Size 6 /Root 1 0 R >>\n")
	buf.WriteString("startxref\n")
	buf.WriteString(strconv.Itoa(xrefPos))
	buf.WriteString("\n%%EOF")
	return buf.Bytes()
}

func buildPDFTextContent(lines []string) string {
	var builder strings.Builder
	builder.WriteString("BT\n/F1 14 Tf\n50 790 Td\n18 TL\n")
	for idx, line := range lines {
		if idx == 0 {
			builder.WriteString("(" + escapePDFText(line) + ") Tj\n")
			continue
		}
		builder.WriteString("T*\n")
		builder.WriteString("(" + escapePDFText(line) + ") Tj\n")
	}
	builder.WriteString("ET")
	return builder.String()
}

func escapePDFText(input string) string {
	replacer := strings.NewReplacer("\\", "\\\\", "(", "\\(", ")", "\\)")
	return replacer.Replace(input)
}

func formatInvoiceDateRange(start *time.Time, end *time.Time) string {
	if start == nil {
		return "TBA"
	}
	if end == nil {
		return start.Format("02 Jan 2006 15:04 MST")
	}
	if start.Format("2006-01-02") == end.Format("2006-01-02") {
		return start.Format("02 Jan 2006 15:04") + " - " + end.Format("15:04 MST")
	}
	return start.Format("02 Jan 2006 15:04 MST") + " - " + end.Format("02 Jan 2006 15:04 MST")
}

func formatInvoiceMoney(currency string, amount int64, isPaid bool) string {
	if !isPaid {
		return "Free"
	}
	return fallbackString(currency, "IDR") + " " + formatThousands(amount)
}

func formatThousands(amount int64) string {
	raw := strconv.FormatInt(amount, 10)
	if len(raw) <= 3 {
		return raw
	}
	parts := make([]string, 0, len(raw)/3+1)
	for len(raw) > 3 {
		parts = append([]string{raw[len(raw)-3:]}, parts...)
		raw = raw[:len(raw)-3]
	}
	if raw != "" {
		parts = append([]string{raw}, parts...)
	}
	return strings.Join(parts, ".")
}

func fallbackString(value string, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func buildTicketSVG(content string) string {
	const size = 29
	const scale = 8
	type rect struct {
		X      int    `xml:"x,attr"`
		Y      int    `xml:"y,attr"`
		Width  int    `xml:"width,attr"`
		Height int    `xml:"height,attr"`
		Fill   string `xml:"fill,attr"`
	}

	hash := sha256.Sum256([]byte(content))
	var rects []rect
	rects = append(rects, rect{X: 0, Y: 0, Width: size * scale, Height: size * scale, Fill: "#FFFFFF"})

	isFinder := func(x, y int, originX, originY int) bool {
		return x >= originX && x < originX+7 && y >= originY && y < originY+7
	}

	fillCell := func(x, y int) {
		rects = append(rects, rect{
			X:      x * scale,
			Y:      y * scale,
			Width:  scale,
			Height: scale,
			Fill:   "#04090C",
		})
	}

	drawFinder := func(originX, originY int) {
		for y := 0; y < 7; y++ {
			for x := 0; x < 7; x++ {
				border := x == 0 || x == 6 || y == 0 || y == 6
				center := x >= 2 && x <= 4 && y >= 2 && y <= 4
				if border || center {
					fillCell(originX+x, originY+y)
				}
			}
		}
	}

	drawFinder(0, 0)
	drawFinder(size-7, 0)
	drawFinder(0, size-7)

	bitIndex := 0
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			if isFinder(x, y, 0, 0) || isFinder(x, y, size-7, 0) || isFinder(x, y, 0, size-7) {
				continue
			}
			byteIndex := (bitIndex / 8) % len(hash)
			bit := (hash[byteIndex] >> uint(bitIndex%8)) & 1
			if bit == 1 || (x+y)%7 == 0 {
				fillCell(x, y)
			}
			bitIndex++
		}
	}

	var out bytes.Buffer
	out.WriteString(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 `)
	out.WriteString(strconv.Itoa(size * scale))
	out.WriteString(` `)
	out.WriteString(strconv.Itoa(size * scale))
	out.WriteString(`" role="img" aria-label="Ticket code">`)
	for _, item := range rects {
		chunk, _ := xml.Marshal(item)
		out.Write(chunk)
	}
	out.WriteString(`</svg>`)
	return out.String()
}
