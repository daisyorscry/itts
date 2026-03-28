package rest

import (
	"encoding/json"
	"net/http"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
)

type BlogHandler struct {
	svc service.BlogService
}

func NewBlogHandler(svc service.BlogService) *BlogHandler {
	return &BlogHandler{svc: svc}
}

func withAbsoluteBlogCoverURL(r *http.Request, post model.BlogPostResponse) model.BlogPostResponse {
	if post.CoverImageURL != "" {
		post.CoverImageURL = buildAbsoluteAssetURL(r, post.CoverImageURL)
	}
	return post
}

func withAbsoluteBlogListCoverURL(r *http.Request, list model.BlogPostListResponse) model.BlogPostListResponse {
	for idx := range list.Data {
		list.Data[idx] = withAbsoluteBlogCoverURL(r, list.Data[idx])
	}
	return list
}

func (h *BlogHandler) ListPublicPosts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if category := q.Get("category"); category != "" {
		lp.Filters["category"] = category
	}

	result, err := h.svc.ListPublicPosts(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteBlogListCoverURL(r, result))
}

func (h *BlogHandler) GetPublicPostBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.svc.GetPublicPostBySlug(r.Context(), slug)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteBlogCoverURL(r, post))
}

func (h *BlogHandler) CreateReviewPost(w http.ResponseWriter, r *http.Request) {
	var req model.CreateBlogReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	post, err := h.svc.CreateReviewPost(r.Context(), authCtx, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, withAbsoluteBlogCoverURL(r, post))
}

func (h *BlogHandler) ListMyPosts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if status := q.Get("status"); status != "" {
		lp.Filters["status"] = status
	}

	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.svc.ListMyPosts(r.Context(), authCtx, lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteBlogListCoverURL(r, result))
}

func (h *BlogHandler) ListPosts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if status := q.Get("status"); status != "" {
		lp.Filters["status"] = status
	}
	if category := q.Get("category"); category != "" {
		lp.Filters["category"] = category
	}

	authCtx := middleware.MustGetAuthContext(r.Context())
	var (
		result model.BlogPostListResponse
		err    error
	)

	if authCtx.HasAnyPermission("blogs:list", "blogs:review") {
		result, err = h.svc.ListPosts(r.Context(), lp)
	} else {
		result, err = h.svc.ListMyPosts(r.Context(), authCtx, lp)
	}

	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteBlogListCoverURL(r, result))
}

func (h *BlogHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	var req model.CreateBlogPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	post, err := h.svc.CreatePost(r.Context(), authCtx, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, withAbsoluteBlogCoverURL(r, post))
}

func (h *BlogHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	post, err := h.svc.GetPost(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteBlogCoverURL(r, post))
}

func (h *BlogHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateBlogPostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	post, err := h.svc.UpdatePost(r.Context(), authCtx, id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteBlogCoverURL(r, post))
}

func (h *BlogHandler) UpdatePostStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateBlogPostStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	post, err := h.svc.UpdatePostStatus(r.Context(), authCtx, id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteBlogCoverURL(r, post))
}

func (h *BlogHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.DeletePost(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}
