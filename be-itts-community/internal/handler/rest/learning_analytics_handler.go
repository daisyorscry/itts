package rest

import (
	"net/http"

	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/repository"
)

func (h *LearningHandler) GetLearningAnalyticsOverview(w http.ResponseWriter, r *http.Request) {
	result, err := h.analyticsSvc.GetLearningAnalyticsOverview(r.Context())
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) ListCourseAnalytics(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	result, err := h.analyticsSvc.ListCourseAnalytics(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}
