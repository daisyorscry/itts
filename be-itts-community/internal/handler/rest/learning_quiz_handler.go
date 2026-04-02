package rest

import (
	"encoding/json"
	"net/http"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
)

func (h *LearningHandler) CreateQuiz(w http.ResponseWriter, r *http.Request) {
	lessonID := chi.URLParam(r, "lesson_id")
	var req model.CreateQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.LessonID = lessonID
	result, err := h.quizSvc.CreateQuiz(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, result)
}

func (h *LearningHandler) GetQuiz(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	result, err := h.quizSvc.GetQuiz(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateQuizRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	result, err := h.quizSvc.UpdateQuiz(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.quizSvc.DeleteQuiz(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

func (h *LearningHandler) SubmitQuizAttempt(w http.ResponseWriter, r *http.Request) {
	var req model.SubmitQuizAttemptRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.quizSvc.SubmitQuizAttempt(r.Context(), authCtx, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, result)
}
