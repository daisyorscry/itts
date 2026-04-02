package rest

import (
	"net/http"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/repository"
)

func (h *LearningHandler) ListCertificates(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	result, err := h.certificateSvc.ListCertificates(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) ListMyCertificates(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.certificateSvc.ListMyCertificates(r.Context(), authCtx, lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) VerifyCertificate(w http.ResponseWriter, r *http.Request) {
	certificateNumber := chi.URLParam(r, "certificate_number")
	result, err := h.certificateSvc.VerifyCertificate(r.Context(), certificateNumber)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}
