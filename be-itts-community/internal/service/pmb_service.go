package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

type pmbService struct {
	pmbRepo repository.PMBRepository
	tracer  nr.Tracer
}

// NewPMBService creates a new PMB service
func NewPMBService(pmbRepo repository.PMBRepository, tracer nr.Tracer) PMBService {
	return &pmbService{
		pmbRepo: pmbRepo,
		tracer:  tracer,
	}
}

/*
|--------------------------------------------------------------------------
| Applicant Operations
|--------------------------------------------------------------------------
*/

func (s *pmbService) CreateApplicant(ctx context.Context, req model.CreateApplicantRequest) (model.ApplicantResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.CreateApplicant")()
	}

	if err := validator.Validate(req); err != nil {
		return model.ApplicantResponse{}, core.ValidationError(err)
	}

	// Check if applicant already exists with this user_id
	existing, err := s.pmbRepo.GetApplicantByUserID(ctx, req.UserID)
	if err == nil && existing != nil {
		return model.ApplicantResponse{}, core.BadRequest("Applicant already exists for this user")
	}

	// Check if national ID already exists
	existingByNID, err := s.pmbRepo.GetApplicantByNationalID(ctx, req.NationalID)
	if err == nil && existingByNID != nil {
		return model.ApplicantResponse{}, core.BadRequest("National ID already registered")
	}

	applicant := req.ToModel()
	if err := s.pmbRepo.CreateApplicant(ctx, &applicant); err != nil {
		return model.ApplicantResponse{}, core.InternalServerError("failed to create applicant").WithError(err)
	}

	result, err := s.pmbRepo.GetApplicantByID(ctx, applicant.ID)
	if err != nil {
		return model.ApplicantResponse{}, core.InternalServerError("failed to load applicant").WithError(err)
	}

	return model.ApplicantToResponse(*result), nil
}

func (s *pmbService) GetApplicant(ctx context.Context, id string) (model.ApplicantResponse, error) {
	applicant, err := s.pmbRepo.GetApplicantByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicantResponse{}, core.NotFound("applicant", id)
		}
		return model.ApplicantResponse{}, core.InternalServerError("failed to get applicant").WithError(err)
	}

	return model.ApplicantToResponse(*applicant), nil
}

func (s *pmbService) GetApplicantByUserID(ctx context.Context, userID string) (model.ApplicantResponse, error) {
	applicant, err := s.pmbRepo.GetApplicantByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicantResponse{}, core.NotFound("applicant for user", userID)
		}
		return model.ApplicantResponse{}, core.InternalServerError("failed to get applicant").WithError(err)
	}

	return model.ApplicantToResponse(*applicant), nil
}

func (s *pmbService) UpdateApplicant(ctx context.Context, id string, req model.UpdateApplicantRequest) (model.ApplicantResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.UpdateApplicant")()
	}

	if err := validator.Validate(req); err != nil {
		return model.ApplicantResponse{}, core.ValidationError(err)
	}

	applicant, err := s.pmbRepo.GetApplicantByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicantResponse{}, core.NotFound("applicant", id)
		}
		return model.ApplicantResponse{}, core.InternalServerError("failed to get applicant").WithError(err)
	}

	// Update fields
	if req.FullName != nil {
		applicant.FullName = *req.FullName
	}
	if req.PlaceOfBirth != nil {
		applicant.PlaceOfBirth = *req.PlaceOfBirth
	}
	if req.DateOfBirth != nil {
		applicant.DateOfBirth = req.DateOfBirth
	}
	if req.Gender != nil {
		applicant.Gender = *req.Gender
	}
	if req.Address != nil {
		applicant.Address = *req.Address
	}
	if req.PhoneNumber != nil {
		applicant.PhoneNumber = *req.PhoneNumber
	}
	if req.SchoolOrigin != nil {
		applicant.SchoolOrigin = *req.SchoolOrigin
	}
	if req.GraduationYear != nil {
		applicant.GraduationYear = *req.GraduationYear
	}

	if err := s.pmbRepo.UpdateApplicant(ctx, applicant); err != nil {
		return model.ApplicantResponse{}, core.InternalServerError("failed to update applicant").WithError(err)
	}

	result, err := s.pmbRepo.GetApplicantByID(ctx, id)
	if err != nil {
		return model.ApplicantResponse{}, core.InternalServerError("failed to load applicant").WithError(err)
	}

	return model.ApplicantToResponse(*result), nil
}

func (s *pmbService) DeleteApplicant(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.DeleteApplicant")()
	}

	if err := s.pmbRepo.DeleteApplicant(ctx, id); err != nil {
		return core.InternalServerError("failed to delete applicant").WithError(err)
	}

	return nil
}

func (s *pmbService) ListApplicants(ctx context.Context, params repository.ListParams) (model.ApplicantListResponse, error) {
	result, err := s.pmbRepo.ListApplicants(ctx, params)
	if err != nil {
		return model.ApplicantListResponse{}, core.InternalServerError("failed to list applicants").WithError(err)
	}

	responses := make([]model.ApplicantResponse, 0, len(result.Data))
	for _, applicant := range result.Data {
		responses = append(responses, model.ApplicantToResponse(applicant))
	}

	return model.ApplicantListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

/*
|--------------------------------------------------------------------------
| Application Operations
|--------------------------------------------------------------------------
*/

func (s *pmbService) CreateApplication(ctx context.Context, req model.CreateApplicationRequest) (model.ApplicationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.CreateApplication")()
	}

	if err := validator.Validate(req); err != nil {
		return model.ApplicationResponse{}, core.ValidationError(err)
	}

	// Validate applicant exists
	if _, err := s.pmbRepo.GetApplicantByID(ctx, req.ApplicantID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicationResponse{}, core.BadRequest("Applicant not found")
		}
		return model.ApplicationResponse{}, core.InternalServerError("failed to validate applicant").WithError(err)
	}

	// Validate track exists
	if _, err := s.pmbRepo.GetAdmissionTrackByID(ctx, req.TrackID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicationResponse{}, core.BadRequest("Admission track not found")
		}
		return model.ApplicationResponse{}, core.InternalServerError("failed to validate track").WithError(err)
	}

	// Validate program exists and check quota
	program, err := s.pmbRepo.GetStudyProgramByID(ctx, req.ProgramID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicationResponse{}, core.BadRequest("Study program not found")
		}
		return model.ApplicationResponse{}, core.InternalServerError("failed to validate program").WithError(err)
	}

	// Check available quota
	availableQuota, err := s.pmbRepo.GetAvailableQuota(ctx, req.ProgramID, req.AcademicYear)
	if err != nil {
		return model.ApplicationResponse{}, core.InternalServerError("failed to check quota").WithError(err)
	}
	if availableQuota <= 0 {
		return model.ApplicationResponse{}, core.BadRequest(fmt.Sprintf("Program %s has no available quota", program.Name))
	}

	application := req.ToModel()

	// Generate application number: PMB-YEAR-PROGRAM-SEQUENCE
	// Example: PMB-2024/2025-TI-0001
	application.ApplicationNumber = s.generateApplicationNumber(req.AcademicYear, program.Code)

	if err := s.pmbRepo.CreateApplication(ctx, &application); err != nil {
		return model.ApplicationResponse{}, core.InternalServerError("failed to create application").WithError(err)
	}

	result, err := s.pmbRepo.GetApplicationByID(ctx, application.ID)
	if err != nil {
		return model.ApplicationResponse{}, core.InternalServerError("failed to load application").WithError(err)
	}

	return model.ApplicationToResponse(*result), nil
}

func (s *pmbService) GetApplication(ctx context.Context, id string) (model.ApplicationResponse, error) {
	application, err := s.pmbRepo.GetApplicationByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicationResponse{}, core.NotFound("application", id)
		}
		return model.ApplicationResponse{}, core.InternalServerError("failed to get application").WithError(err)
	}

	return model.ApplicationToResponse(*application), nil
}

func (s *pmbService) GetApplicationByNumber(ctx context.Context, applicationNumber string) (model.ApplicationResponse, error) {
	application, err := s.pmbRepo.GetApplicationByNumber(ctx, applicationNumber)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicationResponse{}, core.NotFound("application", applicationNumber)
		}
		return model.ApplicationResponse{}, core.InternalServerError("failed to get application").WithError(err)
	}

	return model.ApplicationToResponse(*application), nil
}

func (s *pmbService) GetApplicationWithDetails(ctx context.Context, id string) (model.ApplicationResponse, error) {
	application, err := s.pmbRepo.GetApplicationWithDetails(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicationResponse{}, core.NotFound("application", id)
		}
		return model.ApplicationResponse{}, core.InternalServerError("failed to get application").WithError(err)
	}

	return model.ApplicationToResponse(*application), nil
}

func (s *pmbService) UpdateApplication(ctx context.Context, id string, req model.UpdateApplicationRequest) (model.ApplicationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.UpdateApplication")()
	}

	if err := validator.Validate(req); err != nil {
		return model.ApplicationResponse{}, core.ValidationError(err)
	}

	application, err := s.pmbRepo.GetApplicationByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicationResponse{}, core.NotFound("application", id)
		}
		return model.ApplicationResponse{}, core.InternalServerError("failed to get application").WithError(err)
	}

	// Update fields
	if req.TrackID != nil {
		application.TrackID = *req.TrackID
	}
	if req.ProgramID != nil {
		application.ProgramID = *req.ProgramID
	}
	if req.AcademicYear != nil {
		application.AcademicYear = *req.AcademicYear
	}
	if req.Status != nil {
		application.Status = *req.Status
	}

	if err := s.pmbRepo.UpdateApplication(ctx, application); err != nil {
		return model.ApplicationResponse{}, core.InternalServerError("failed to update application").WithError(err)
	}

	result, err := s.pmbRepo.GetApplicationByID(ctx, id)
	if err != nil {
		return model.ApplicationResponse{}, core.InternalServerError("failed to load application").WithError(err)
	}

	return model.ApplicationToResponse(*result), nil
}

func (s *pmbService) UpdateApplicationStatus(ctx context.Context, id string, req model.UpdateApplicationStatusRequest) (model.ApplicationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.UpdateApplicationStatus")()
	}

	if err := validator.Validate(req); err != nil {
		return model.ApplicationResponse{}, core.ValidationError(err)
	}

	if err := s.pmbRepo.UpdateApplicationStatus(ctx, id, req.Status); err != nil {
		return model.ApplicationResponse{}, core.InternalServerError("failed to update application status").WithError(err)
	}

	result, err := s.pmbRepo.GetApplicationByID(ctx, id)
	if err != nil {
		return model.ApplicationResponse{}, core.InternalServerError("failed to load application").WithError(err)
	}

	return model.ApplicationToResponse(*result), nil
}

func (s *pmbService) DeleteApplication(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.DeleteApplication")()
	}

	if err := s.pmbRepo.DeleteApplication(ctx, id); err != nil {
		return core.InternalServerError("failed to delete application").WithError(err)
	}

	return nil
}

func (s *pmbService) ListApplications(ctx context.Context, params repository.ListParams) (model.ApplicationListResponse, error) {
	result, err := s.pmbRepo.ListApplications(ctx, params)
	if err != nil {
		return model.ApplicationListResponse{}, core.InternalServerError("failed to list applications").WithError(err)
	}

	return s.buildApplicationListResponse(result), nil
}

func (s *pmbService) ListApplicationsByApplicant(ctx context.Context, applicantID string, params repository.ListParams) (model.ApplicationListResponse, error) {
	result, err := s.pmbRepo.ListApplicationsByApplicant(ctx, applicantID, params)
	if err != nil {
		return model.ApplicationListResponse{}, core.InternalServerError("failed to list applications").WithError(err)
	}

	return s.buildApplicationListResponse(result), nil
}

func (s *pmbService) ListApplicationsByTrack(ctx context.Context, trackID string, params repository.ListParams) (model.ApplicationListResponse, error) {
	result, err := s.pmbRepo.ListApplicationsByTrack(ctx, trackID, params)
	if err != nil {
		return model.ApplicationListResponse{}, core.InternalServerError("failed to list applications").WithError(err)
	}

	return s.buildApplicationListResponse(result), nil
}

func (s *pmbService) ListApplicationsByProgram(ctx context.Context, programID string, params repository.ListParams) (model.ApplicationListResponse, error) {
	result, err := s.pmbRepo.ListApplicationsByProgram(ctx, programID, params)
	if err != nil {
		return model.ApplicationListResponse{}, core.InternalServerError("failed to list applications").WithError(err)
	}

	return s.buildApplicationListResponse(result), nil
}

/*
|--------------------------------------------------------------------------
| Admission Track Operations
|--------------------------------------------------------------------------
*/

func (s *pmbService) CreateAdmissionTrack(ctx context.Context, req model.CreateAdmissionTrackRequest) (model.AdmissionTrackResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.CreateAdmissionTrack")()
	}

	if err := validator.Validate(req); err != nil {
		return model.AdmissionTrackResponse{}, core.ValidationError(err)
	}

	track := req.ToModel()
	if err := s.pmbRepo.CreateAdmissionTrack(ctx, &track); err != nil {
		return model.AdmissionTrackResponse{}, core.InternalServerError("failed to create admission track").WithError(err)
	}

	result, err := s.pmbRepo.GetAdmissionTrackByID(ctx, track.ID)
	if err != nil {
		return model.AdmissionTrackResponse{}, core.InternalServerError("failed to load admission track").WithError(err)
	}

	return model.AdmissionTrackToResponse(*result), nil
}

func (s *pmbService) GetAdmissionTrack(ctx context.Context, id string) (model.AdmissionTrackResponse, error) {
	track, err := s.pmbRepo.GetAdmissionTrackByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AdmissionTrackResponse{}, core.NotFound("admission track", id)
		}
		return model.AdmissionTrackResponse{}, core.InternalServerError("failed to get admission track").WithError(err)
	}

	return model.AdmissionTrackToResponse(*track), nil
}

func (s *pmbService) GetAdmissionTrackByCode(ctx context.Context, code string) (model.AdmissionTrackResponse, error) {
	track, err := s.pmbRepo.GetAdmissionTrackByCode(ctx, code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AdmissionTrackResponse{}, core.NotFound("admission track", code)
		}
		return model.AdmissionTrackResponse{}, core.InternalServerError("failed to get admission track").WithError(err)
	}

	return model.AdmissionTrackToResponse(*track), nil
}

func (s *pmbService) UpdateAdmissionTrack(ctx context.Context, id string, req model.UpdateAdmissionTrackRequest) (model.AdmissionTrackResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.UpdateAdmissionTrack")()
	}

	if err := validator.Validate(req); err != nil {
		return model.AdmissionTrackResponse{}, core.ValidationError(err)
	}

	track, err := s.pmbRepo.GetAdmissionTrackByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AdmissionTrackResponse{}, core.NotFound("admission track", id)
		}
		return model.AdmissionTrackResponse{}, core.InternalServerError("failed to get admission track").WithError(err)
	}

	if req.TrackCode != nil {
		track.TrackCode = *req.TrackCode
	}
	if req.TrackName != nil {
		track.TrackName = *req.TrackName
	}
	if req.RequiresTest != nil {
		track.RequiresTest = *req.RequiresTest
	}
	if req.IsActive != nil {
		track.IsActive = *req.IsActive
	}

	if err := s.pmbRepo.UpdateAdmissionTrack(ctx, track); err != nil {
		return model.AdmissionTrackResponse{}, core.InternalServerError("failed to update admission track").WithError(err)
	}

	result, err := s.pmbRepo.GetAdmissionTrackByID(ctx, id)
	if err != nil {
		return model.AdmissionTrackResponse{}, core.InternalServerError("failed to load admission track").WithError(err)
	}

	return model.AdmissionTrackToResponse(*result), nil
}

func (s *pmbService) DeleteAdmissionTrack(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.DeleteAdmissionTrack")()
	}

	if err := s.pmbRepo.DeleteAdmissionTrack(ctx, id); err != nil {
		return core.InternalServerError("failed to delete admission track").WithError(err)
	}

	return nil
}

func (s *pmbService) ListAdmissionTracks(ctx context.Context, params repository.ListParams) (model.AdmissionTrackListResponse, error) {
	result, err := s.pmbRepo.ListAdmissionTracks(ctx, params)
	if err != nil {
		return model.AdmissionTrackListResponse{}, core.InternalServerError("failed to list admission tracks").WithError(err)
	}

	responses := make([]model.AdmissionTrackResponse, 0, len(result.Data))
	for _, track := range result.Data {
		responses = append(responses, model.AdmissionTrackToResponse(track))
	}

	return model.AdmissionTrackListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

func (s *pmbService) ListActiveAdmissionTracks(ctx context.Context) ([]model.AdmissionTrackResponse, error) {
	tracks, err := s.pmbRepo.ListActiveAdmissionTracks(ctx)
	if err != nil {
		return nil, core.InternalServerError("failed to list active admission tracks").WithError(err)
	}

	responses := make([]model.AdmissionTrackResponse, 0, len(tracks))
	for _, track := range tracks {
		responses = append(responses, model.AdmissionTrackToResponse(track))
	}

	return responses, nil
}

/*
|--------------------------------------------------------------------------
| Faculty Operations
|--------------------------------------------------------------------------
*/

func (s *pmbService) CreateFaculty(ctx context.Context, req model.CreateFacultyRequest) (model.FacultyResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.CreateFaculty")()
	}

	if err := validator.Validate(req); err != nil {
		return model.FacultyResponse{}, core.ValidationError(err)
	}

	faculty := req.ToModel()
	if err := s.pmbRepo.CreateFaculty(ctx, &faculty); err != nil {
		return model.FacultyResponse{}, core.InternalServerError("failed to create faculty").WithError(err)
	}

	result, err := s.pmbRepo.GetFacultyByID(ctx, faculty.ID)
	if err != nil {
		return model.FacultyResponse{}, core.InternalServerError("failed to load faculty").WithError(err)
	}

	return model.FacultyToResponse(*result), nil
}

func (s *pmbService) GetFaculty(ctx context.Context, id string) (model.FacultyResponse, error) {
	faculty, err := s.pmbRepo.GetFacultyByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.FacultyResponse{}, core.NotFound("faculty", id)
		}
		return model.FacultyResponse{}, core.InternalServerError("failed to get faculty").WithError(err)
	}

	return model.FacultyToResponse(*faculty), nil
}

func (s *pmbService) GetFacultyByCode(ctx context.Context, code string) (model.FacultyResponse, error) {
	faculty, err := s.pmbRepo.GetFacultyByCode(ctx, code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.FacultyResponse{}, core.NotFound("faculty", code)
		}
		return model.FacultyResponse{}, core.InternalServerError("failed to get faculty").WithError(err)
	}

	return model.FacultyToResponse(*faculty), nil
}

func (s *pmbService) GetFacultyWithPrograms(ctx context.Context, id string) (model.FacultyResponse, error) {
	faculty, err := s.pmbRepo.GetFacultyWithPrograms(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.FacultyResponse{}, core.NotFound("faculty", id)
		}
		return model.FacultyResponse{}, core.InternalServerError("failed to get faculty").WithError(err)
	}

	return model.FacultyToResponse(*faculty), nil
}

func (s *pmbService) UpdateFaculty(ctx context.Context, id string, req model.UpdateFacultyRequest) (model.FacultyResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.UpdateFaculty")()
	}

	if err := validator.Validate(req); err != nil {
		return model.FacultyResponse{}, core.ValidationError(err)
	}

	faculty, err := s.pmbRepo.GetFacultyByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.FacultyResponse{}, core.NotFound("faculty", id)
		}
		return model.FacultyResponse{}, core.InternalServerError("failed to get faculty").WithError(err)
	}

	if req.Code != nil {
		faculty.Code = *req.Code
	}
	if req.Name != nil {
		faculty.Name = *req.Name
	}

	if err := s.pmbRepo.UpdateFaculty(ctx, faculty); err != nil {
		return model.FacultyResponse{}, core.InternalServerError("failed to update faculty").WithError(err)
	}

	result, err := s.pmbRepo.GetFacultyByID(ctx, id)
	if err != nil {
		return model.FacultyResponse{}, core.InternalServerError("failed to load faculty").WithError(err)
	}

	return model.FacultyToResponse(*result), nil
}

func (s *pmbService) DeleteFaculty(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.DeleteFaculty")()
	}

	if err := s.pmbRepo.DeleteFaculty(ctx, id); err != nil {
		return core.InternalServerError("failed to delete faculty").WithError(err)
	}

	return nil
}

func (s *pmbService) ListFaculties(ctx context.Context, params repository.ListParams) (model.FacultyListResponse, error) {
	result, err := s.pmbRepo.ListFaculties(ctx, params)
	if err != nil {
		return model.FacultyListResponse{}, core.InternalServerError("failed to list faculties").WithError(err)
	}

	responses := make([]model.FacultyResponse, 0, len(result.Data))
	for _, faculty := range result.Data {
		responses = append(responses, model.FacultyToResponse(faculty))
	}

	return model.FacultyListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

/*
|--------------------------------------------------------------------------
| Study Program Operations (Continuing...)
|--------------------------------------------------------------------------
*/

func (s *pmbService) CreateStudyProgram(ctx context.Context, req model.CreateStudyProgramRequest) (model.StudyProgramResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.CreateStudyProgram")()
	}

	if err := validator.Validate(req); err != nil {
		return model.StudyProgramResponse{}, core.ValidationError(err)
	}

	// Validate faculty exists
	if _, err := s.pmbRepo.GetFacultyByID(ctx, req.FacultyID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.StudyProgramResponse{}, core.BadRequest("Faculty not found")
		}
		return model.StudyProgramResponse{}, core.InternalServerError("failed to validate faculty").WithError(err)
	}

	program := req.ToModel()
	if err := s.pmbRepo.CreateStudyProgram(ctx, &program); err != nil {
		return model.StudyProgramResponse{}, core.InternalServerError("failed to create study program").WithError(err)
	}

	result, err := s.pmbRepo.GetStudyProgramWithFaculty(ctx, program.ID)
	if err != nil {
		return model.StudyProgramResponse{}, core.InternalServerError("failed to load study program").WithError(err)
	}

	return model.StudyProgramToResponse(*result), nil
}

func (s *pmbService) GetStudyProgram(ctx context.Context, id string) (model.StudyProgramResponse, error) {
	program, err := s.pmbRepo.GetStudyProgramByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.StudyProgramResponse{}, core.NotFound("study program", id)
		}
		return model.StudyProgramResponse{}, core.InternalServerError("failed to get study program").WithError(err)
	}

	return model.StudyProgramToResponse(*program), nil
}

func (s *pmbService) GetStudyProgramByCode(ctx context.Context, code string) (model.StudyProgramResponse, error) {
	program, err := s.pmbRepo.GetStudyProgramByCode(ctx, code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.StudyProgramResponse{}, core.NotFound("study program", code)
		}
		return model.StudyProgramResponse{}, core.InternalServerError("failed to get study program").WithError(err)
	}

	return model.StudyProgramToResponse(*program), nil
}

func (s *pmbService) GetStudyProgramWithFaculty(ctx context.Context, id string) (model.StudyProgramResponse, error) {
	program, err := s.pmbRepo.GetStudyProgramWithFaculty(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.StudyProgramResponse{}, core.NotFound("study program", id)
		}
		return model.StudyProgramResponse{}, core.InternalServerError("failed to get study program").WithError(err)
	}

	return model.StudyProgramToResponse(*program), nil
}

func (s *pmbService) UpdateStudyProgram(ctx context.Context, id string, req model.UpdateStudyProgramRequest) (model.StudyProgramResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.UpdateStudyProgram")()
	}

	if err := validator.Validate(req); err != nil {
		return model.StudyProgramResponse{}, core.ValidationError(err)
	}

	program, err := s.pmbRepo.GetStudyProgramByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.StudyProgramResponse{}, core.NotFound("study program", id)
		}
		return model.StudyProgramResponse{}, core.InternalServerError("failed to get study program").WithError(err)
	}

	if req.FacultyID != nil {
		program.FacultyID = *req.FacultyID
	}
	if req.Code != nil {
		program.Code = *req.Code
	}
	if req.Name != nil {
		program.Name = *req.Name
	}
	if req.DegreeLevel != nil {
		program.DegreeLevel = *req.DegreeLevel
	}
	if req.Quota != nil {
		program.Quota = *req.Quota
	}

	if err := s.pmbRepo.UpdateStudyProgram(ctx, program); err != nil {
		return model.StudyProgramResponse{}, core.InternalServerError("failed to update study program").WithError(err)
	}

	result, err := s.pmbRepo.GetStudyProgramWithFaculty(ctx, id)
	if err != nil {
		return model.StudyProgramResponse{}, core.InternalServerError("failed to load study program").WithError(err)
	}

	return model.StudyProgramToResponse(*result), nil
}

func (s *pmbService) DeleteStudyProgram(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PMBService.DeleteStudyProgram")()
	}

	if err := s.pmbRepo.DeleteStudyProgram(ctx, id); err != nil {
		return core.InternalServerError("failed to delete study program").WithError(err)
	}

	return nil
}

func (s *pmbService) ListStudyPrograms(ctx context.Context, params repository.ListParams) (model.StudyProgramListResponse, error) {
	result, err := s.pmbRepo.ListStudyPrograms(ctx, params)
	if err != nil {
		return model.StudyProgramListResponse{}, core.InternalServerError("failed to list study programs").WithError(err)
	}

	responses := make([]model.StudyProgramResponse, 0, len(result.Data))
	for _, program := range result.Data {
		responses = append(responses, model.StudyProgramToResponse(program))
	}

	return model.StudyProgramListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

func (s *pmbService) ListStudyProgramsByFaculty(ctx context.Context, facultyID string) ([]model.StudyProgramResponse, error) {
	programs, err := s.pmbRepo.ListStudyProgramsByFaculty(ctx, facultyID)
	if err != nil {
		return nil, core.InternalServerError("failed to list study programs by faculty").WithError(err)
	}

	responses := make([]model.StudyProgramResponse, 0, len(programs))
	for _, program := range programs {
		responses = append(responses, model.StudyProgramToResponse(program))
	}

	return responses, nil
}

func (s *pmbService) GetAvailableQuota(ctx context.Context, programID string, academicYear string) (int, error) {
	quota, err := s.pmbRepo.GetAvailableQuota(ctx, programID, academicYear)
	if err != nil {
		return 0, core.InternalServerError("failed to get available quota").WithError(err)
	}

	return quota, nil
}

/*
|--------------------------------------------------------------------------
| Document, Evaluation, Result, Re-registration operations
| (Simplified implementations - follow same pattern)
|--------------------------------------------------------------------------
*/

// Applicant Document Operations
func (s *pmbService) CreateApplicantDocument(ctx context.Context, req model.CreateApplicantDocumentRequest) (model.ApplicantDocumentResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.ApplicantDocumentResponse{}, core.ValidationError(err)
	}

	doc := req.ToModel()
	if err := s.pmbRepo.CreateApplicantDocument(ctx, &doc); err != nil {
		return model.ApplicantDocumentResponse{}, core.InternalServerError("failed to create document").WithError(err)
	}

	result, err := s.pmbRepo.GetApplicantDocumentByID(ctx, doc.ID)
	if err != nil {
		return model.ApplicantDocumentResponse{}, core.InternalServerError("failed to load document").WithError(err)
	}

	return model.ApplicantDocumentToResponse(*result), nil
}

func (s *pmbService) GetApplicantDocument(ctx context.Context, id string) (model.ApplicantDocumentResponse, error) {
	doc, err := s.pmbRepo.GetApplicantDocumentByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ApplicantDocumentResponse{}, core.NotFound("document", id)
		}
		return model.ApplicantDocumentResponse{}, core.InternalServerError("failed to get document").WithError(err)
	}

	return model.ApplicantDocumentToResponse(*doc), nil
}

func (s *pmbService) UpdateDocumentVerification(ctx context.Context, id string, req model.UpdateDocumentVerificationRequest) (model.ApplicantDocumentResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.ApplicantDocumentResponse{}, core.ValidationError(err)
	}

	if err := s.pmbRepo.UpdateDocumentVerificationStatus(ctx, id, req.Status, req.VerifiedBy); err != nil {
		return model.ApplicantDocumentResponse{}, core.InternalServerError("failed to update document verification").WithError(err)
	}

	result, err := s.pmbRepo.GetApplicantDocumentByID(ctx, id)
	if err != nil {
		return model.ApplicantDocumentResponse{}, core.InternalServerError("failed to load document").WithError(err)
	}

	return model.ApplicantDocumentToResponse(*result), nil
}

func (s *pmbService) DeleteApplicantDocument(ctx context.Context, id string) error {
	return s.pmbRepo.DeleteApplicantDocument(ctx, id)
}

func (s *pmbService) ListApplicantDocuments(ctx context.Context, params repository.ListParams) (model.ApplicantDocumentListResponse, error) {
	result, err := s.pmbRepo.ListApplicantDocuments(ctx, params)
	if err != nil {
		return model.ApplicantDocumentListResponse{}, core.InternalServerError("failed to list documents").WithError(err)
	}

	responses := make([]model.ApplicantDocumentResponse, 0, len(result.Data))
	for _, doc := range result.Data {
		responses = append(responses, model.ApplicantDocumentToResponse(doc))
	}

	return model.ApplicantDocumentListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

func (s *pmbService) ListDocumentsByApplicant(ctx context.Context, applicantID string) ([]model.ApplicantDocumentResponse, error) {
	docs, err := s.pmbRepo.ListDocumentsByApplicant(ctx, applicantID)
	if err != nil {
		return nil, core.InternalServerError("failed to list documents by applicant").WithError(err)
	}

	responses := make([]model.ApplicantDocumentResponse, 0, len(docs))
	for _, doc := range docs {
		responses = append(responses, model.ApplicantDocumentToResponse(doc))
	}

	return responses, nil
}

// Evaluation Operations (simplified)
func (s *pmbService) CreateEvaluation(ctx context.Context, req model.CreateEvaluationRequest) (model.EvaluationResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.EvaluationResponse{}, core.ValidationError(err)
	}

	eval := req.ToModel()
	if err := s.pmbRepo.CreateEvaluation(ctx, &eval); err != nil {
		return model.EvaluationResponse{}, core.InternalServerError("failed to create evaluation").WithError(err)
	}

	result, err := s.pmbRepo.GetEvaluationByID(ctx, eval.ID)
	if err != nil {
		return model.EvaluationResponse{}, core.InternalServerError("failed to load evaluation").WithError(err)
	}

	return model.EvaluationToResponse(*result), nil
}

func (s *pmbService) GetEvaluation(ctx context.Context, id string) (model.EvaluationResponse, error) {
	eval, err := s.pmbRepo.GetEvaluationByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EvaluationResponse{}, core.NotFound("evaluation", id)
		}
		return model.EvaluationResponse{}, core.InternalServerError("failed to get evaluation").WithError(err)
	}

	return model.EvaluationToResponse(*eval), nil
}

func (s *pmbService) UpdateEvaluation(ctx context.Context, id string, req model.UpdateEvaluationRequest) (model.EvaluationResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.EvaluationResponse{}, core.ValidationError(err)
	}

	eval, err := s.pmbRepo.GetEvaluationByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EvaluationResponse{}, core.NotFound("evaluation", id)
		}
		return model.EvaluationResponse{}, core.InternalServerError("failed to get evaluation").WithError(err)
	}

	if req.EvaluationType != nil {
		eval.EvaluationType = *req.EvaluationType
	}
	if req.Score != nil {
		eval.Score = req.Score
	}
	if req.Notes != nil {
		eval.Notes = *req.Notes
	}

	if err := s.pmbRepo.UpdateEvaluation(ctx, eval); err != nil {
		return model.EvaluationResponse{}, core.InternalServerError("failed to update evaluation").WithError(err)
	}

	result, err := s.pmbRepo.GetEvaluationByID(ctx, id)
	if err != nil {
		return model.EvaluationResponse{}, core.InternalServerError("failed to load evaluation").WithError(err)
	}

	return model.EvaluationToResponse(*result), nil
}

func (s *pmbService) DeleteEvaluation(ctx context.Context, id string) error {
	return s.pmbRepo.DeleteEvaluation(ctx, id)
}

func (s *pmbService) ListEvaluations(ctx context.Context, params repository.ListParams) (model.EvaluationListResponse, error) {
	result, err := s.pmbRepo.ListEvaluations(ctx, params)
	if err != nil {
		return model.EvaluationListResponse{}, core.InternalServerError("failed to list evaluations").WithError(err)
	}

	responses := make([]model.EvaluationResponse, 0, len(result.Data))
	for _, eval := range result.Data {
		responses = append(responses, model.EvaluationToResponse(eval))
	}

	return model.EvaluationListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

func (s *pmbService) ListEvaluationsByApplication(ctx context.Context, applicationID string) ([]model.EvaluationResponse, error) {
	evals, err := s.pmbRepo.ListEvaluationsByApplication(ctx, applicationID)
	if err != nil {
		return nil, core.InternalServerError("failed to list evaluations by application").WithError(err)
	}

	responses := make([]model.EvaluationResponse, 0, len(evals))
	for _, eval := range evals {
		responses = append(responses, model.EvaluationToResponse(eval))
	}

	return responses, nil
}

func (s *pmbService) GetAverageScore(ctx context.Context, applicationID string) (float64, error) {
	score, err := s.pmbRepo.GetAverageScore(ctx, applicationID)
	if err != nil {
		return 0, core.InternalServerError("failed to get average score").WithError(err)
	}

	return score, nil
}

// Final Result Operations (simplified)
func (s *pmbService) CreateFinalResult(ctx context.Context, req model.CreateFinalResultRequest) (model.FinalResultResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.FinalResultResponse{}, core.ValidationError(err)
	}

	result := req.ToModel()
	if err := s.pmbRepo.CreateFinalResult(ctx, &result); err != nil {
		return model.FinalResultResponse{}, core.InternalServerError("failed to create final result").WithError(err)
	}

	loaded, err := s.pmbRepo.GetFinalResultByID(ctx, result.ID)
	if err != nil {
		return model.FinalResultResponse{}, core.InternalServerError("failed to load final result").WithError(err)
	}

	return model.FinalResultToResponse(*loaded), nil
}

func (s *pmbService) GetFinalResult(ctx context.Context, id string) (model.FinalResultResponse, error) {
	result, err := s.pmbRepo.GetFinalResultByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.FinalResultResponse{}, core.NotFound("final result", id)
		}
		return model.FinalResultResponse{}, core.InternalServerError("failed to get final result").WithError(err)
	}

	return model.FinalResultToResponse(*result), nil
}

func (s *pmbService) GetFinalResultByApplication(ctx context.Context, applicationID string) (model.FinalResultResponse, error) {
	result, err := s.pmbRepo.GetFinalResultByApplication(ctx, applicationID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.FinalResultResponse{}, core.NotFound("final result for application", applicationID)
		}
		return model.FinalResultResponse{}, core.InternalServerError("failed to get final result").WithError(err)
	}

	return model.FinalResultToResponse(*result), nil
}

func (s *pmbService) UpdateFinalResult(ctx context.Context, id string, req model.UpdateFinalResultRequest) (model.FinalResultResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.FinalResultResponse{}, core.ValidationError(err)
	}

	result, err := s.pmbRepo.GetFinalResultByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.FinalResultResponse{}, core.NotFound("final result", id)
		}
		return model.FinalResultResponse{}, core.InternalServerError("failed to get final result").WithError(err)
	}

	if req.ResultStatus != nil {
		result.ResultStatus = *req.ResultStatus
	}
	if req.FinalScore != nil {
		result.FinalScore = req.FinalScore
	}
	if req.DecidedBy != nil {
		result.DecidedBy = req.DecidedBy
	}

	if err := s.pmbRepo.UpdateFinalResult(ctx, result); err != nil {
		return model.FinalResultResponse{}, core.InternalServerError("failed to update final result").WithError(err)
	}

	loaded, err := s.pmbRepo.GetFinalResultByID(ctx, id)
	if err != nil {
		return model.FinalResultResponse{}, core.InternalServerError("failed to load final result").WithError(err)
	}

	return model.FinalResultToResponse(*loaded), nil
}

func (s *pmbService) DeleteFinalResult(ctx context.Context, id string) error {
	return s.pmbRepo.DeleteFinalResult(ctx, id)
}

func (s *pmbService) ListFinalResults(ctx context.Context, params repository.ListParams) (model.FinalResultListResponse, error) {
	result, err := s.pmbRepo.ListFinalResults(ctx, params)
	if err != nil {
		return model.FinalResultListResponse{}, core.InternalServerError("failed to list final results").WithError(err)
	}

	responses := make([]model.FinalResultResponse, 0, len(result.Data))
	for _, res := range result.Data {
		responses = append(responses, model.FinalResultToResponse(res))
	}

	return model.FinalResultListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

func (s *pmbService) ListPassedApplicants(ctx context.Context, academicYear string, programID *string) ([]model.FinalResultResponse, error) {
	results, err := s.pmbRepo.ListPassedApplicants(ctx, academicYear, programID)
	if err != nil {
		return nil, core.InternalServerError("failed to list passed applicants").WithError(err)
	}

	responses := make([]model.FinalResultResponse, 0, len(results))
	for _, res := range results {
		responses = append(responses, model.FinalResultToResponse(res))
	}

	return responses, nil
}

// Re-Registration Operations (simplified)
func (s *pmbService) CreateReRegistration(ctx context.Context, req model.CreateReRegistrationRequest) (model.ReRegistrationResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.ReRegistrationResponse{}, core.ValidationError(err)
	}

	reReg := req.ToModel()
	if err := s.pmbRepo.CreateReRegistration(ctx, &reReg); err != nil {
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to create re-registration").WithError(err)
	}

	result, err := s.pmbRepo.GetReRegistrationByID(ctx, reReg.ID)
	if err != nil {
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to load re-registration").WithError(err)
	}

	return model.ReRegistrationToResponse(*result), nil
}

func (s *pmbService) GetReRegistration(ctx context.Context, id string) (model.ReRegistrationResponse, error) {
	reReg, err := s.pmbRepo.GetReRegistrationByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ReRegistrationResponse{}, core.NotFound("re-registration", id)
		}
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to get re-registration").WithError(err)
	}

	return model.ReRegistrationToResponse(*reReg), nil
}

func (s *pmbService) GetReRegistrationByApplication(ctx context.Context, applicationID string) (model.ReRegistrationResponse, error) {
	reReg, err := s.pmbRepo.GetReRegistrationByApplication(ctx, applicationID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ReRegistrationResponse{}, core.NotFound("re-registration for application", applicationID)
		}
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to get re-registration").WithError(err)
	}

	return model.ReRegistrationToResponse(*reReg), nil
}

func (s *pmbService) UpdateReRegistration(ctx context.Context, id string, req model.UpdateReRegistrationRequest) (model.ReRegistrationResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.ReRegistrationResponse{}, core.ValidationError(err)
	}

	reReg, err := s.pmbRepo.GetReRegistrationByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.ReRegistrationResponse{}, core.NotFound("re-registration", id)
		}
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to get re-registration").WithError(err)
	}

	if req.ReRegistrationDate != nil {
		reReg.ReRegistrationDate = *req.ReRegistrationDate
	}
	if req.PaymentStatus != nil {
		reReg.PaymentStatus = *req.PaymentStatus
	}
	if req.PaymentProof != nil {
		reReg.PaymentProof = *req.PaymentProof
	}

	if err := s.pmbRepo.UpdateReRegistration(ctx, reReg); err != nil {
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to update re-registration").WithError(err)
	}

	result, err := s.pmbRepo.GetReRegistrationByID(ctx, id)
	if err != nil {
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to load re-registration").WithError(err)
	}

	return model.ReRegistrationToResponse(*result), nil
}

func (s *pmbService) UpdatePaymentStatus(ctx context.Context, id string, req model.UpdatePaymentStatusRequest) (model.ReRegistrationResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.ReRegistrationResponse{}, core.ValidationError(err)
	}

	if err := s.pmbRepo.UpdatePaymentStatus(ctx, id, req.PaymentStatus, req.PaymentProof); err != nil {
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to update payment status").WithError(err)
	}

	result, err := s.pmbRepo.GetReRegistrationByID(ctx, id)
	if err != nil {
		return model.ReRegistrationResponse{}, core.InternalServerError("failed to load re-registration").WithError(err)
	}

	return model.ReRegistrationToResponse(*result), nil
}

func (s *pmbService) DeleteReRegistration(ctx context.Context, id string) error {
	return s.pmbRepo.DeleteReRegistration(ctx, id)
}

func (s *pmbService) ListReRegistrations(ctx context.Context, params repository.ListParams) (model.ReRegistrationListResponse, error) {
	result, err := s.pmbRepo.ListReRegistrations(ctx, params)
	if err != nil {
		return model.ReRegistrationListResponse{}, core.InternalServerError("failed to list re-registrations").WithError(err)
	}

	responses := make([]model.ReRegistrationResponse, 0, len(result.Data))
	for _, reReg := range result.Data {
		responses = append(responses, model.ReRegistrationToResponse(reReg))
	}

	return model.ReRegistrationListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

func (s *pmbService) ListPendingPayments(ctx context.Context, academicYear string) ([]model.ReRegistrationResponse, error) {
	reRegs, err := s.pmbRepo.ListPendingPayments(ctx, academicYear)
	if err != nil {
		return nil, core.InternalServerError("failed to list pending payments").WithError(err)
	}

	responses := make([]model.ReRegistrationResponse, 0, len(reRegs))
	for _, reReg := range reRegs {
		responses = append(responses, model.ReRegistrationToResponse(reReg))
	}

	return responses, nil
}

/*
|--------------------------------------------------------------------------
| Analytics & Reports
|--------------------------------------------------------------------------
*/

func (s *pmbService) GetApplicationStatsByAcademicYear(ctx context.Context, academicYear string) (model.ApplicationStatsResponse, error) {
	stats, err := s.pmbRepo.GetApplicationStatsByAcademicYear(ctx, academicYear)
	if err != nil {
		return model.ApplicationStatsResponse{}, core.InternalServerError("failed to get application stats").WithError(err)
	}

	response := model.ApplicationStatsResponse{
		AcademicYear: academicYear,
		Total:        stats["total"].(int64),
		ByStatus:     stats["by_status"].(map[string]int64),
	}

	// Convert track counts
	if trackCounts, ok := stats["by_track"].([]struct {
		TrackID   string
		TrackName string
		Count     int64
	}); ok {
		response.ByTrack = make([]model.TrackStatistic, 0, len(trackCounts))
		for _, tc := range trackCounts {
			response.ByTrack = append(response.ByTrack, model.TrackStatistic{
				TrackID:   tc.TrackID,
				TrackName: tc.TrackName,
				Count:     tc.Count,
			})
		}
	}

	// Convert program counts
	if programCounts, ok := stats["by_program"].([]struct {
		ProgramID   string
		ProgramName string
		Count       int64
	}); ok {
		response.ByProgram = make([]model.ProgramStatistic, 0, len(programCounts))
		for _, pc := range programCounts {
			response.ByProgram = append(response.ByProgram, model.ProgramStatistic{
				ProgramID:   pc.ProgramID,
				ProgramName: pc.ProgramName,
				Count:       pc.Count,
			})
		}
	}

	return response, nil
}

func (s *pmbService) GetApplicationStatsByProgram(ctx context.Context, programID string, academicYear string) (model.ProgramDetailStatsResponse, error) {
	stats, err := s.pmbRepo.GetApplicationStatsByProgram(ctx, programID, academicYear)
	if err != nil {
		return model.ProgramDetailStatsResponse{}, core.InternalServerError("failed to get program stats").WithError(err)
	}

	program := stats["program"].(model.StudyProgram)

	return model.ProgramDetailStatsResponse{
		Program:        model.StudyProgramToResponse(program),
		Total:          stats["total"].(int64),
		ByStatus:       stats["by_status"].(map[string]int64),
		Quota:          stats["quota"].(int),
		AvailableQuota: stats["available_quota"].(int),
		FilledQuota:    stats["filled_quota"].(int),
	}, nil
}

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

func (s *pmbService) generateApplicationNumber(academicYear, programCode string) string {
	timestamp := time.Now().Unix()
	return fmt.Sprintf("PMB-%s-%s-%d", academicYear, programCode, timestamp)
}

func (s *pmbService) buildApplicationListResponse(result *repository.PageResult[model.Application]) model.ApplicationListResponse {
	responses := make([]model.ApplicationResponse, 0, len(result.Data))
	for _, app := range result.Data {
		responses = append(responses, model.ApplicationToResponse(app))
	}

	return model.ApplicationListResponse{
		Data:       responses,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}
}
