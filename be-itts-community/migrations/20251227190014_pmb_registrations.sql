-- +goose Up
-- +goose StatementBegin

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('male', 'female');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'degree_level_enum') THEN
        CREATE TYPE degree_level_enum AS ENUM ('D3', 'S1', 'S2', 'S3');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(16) NOT NULL UNIQUE,
    place_of_birth VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender gender_enum NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    school_origin VARCHAR(150) NOT NULL,
    graduation_year VARCHAR(4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_applicant_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admission_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_code VARCHAR(20) NOT NULL UNIQUE,
    track_name VARCHAR(100) NOT NULL,
    requires_test BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    degree_level degree_level_enum NOT NULL,
    quota INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_program_faculty
        FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL,
    track_id UUID NOT NULL,
    program_id UUID NOT NULL,
    academic_year VARCHAR(9) NOT NULL,
    application_number VARCHAR(30) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('draft', 'verified', 'passed', 'failed', 're_registered')
    ),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_application_applicant
        FOREIGN KEY (applicant_id) REFERENCES applicants(id),
    CONSTRAINT fk_application_track
        FOREIGN KEY (track_id) REFERENCES admission_tracks(id),
    CONSTRAINT fk_application_program
        FOREIGN KEY (program_id) REFERENCES study_programs(id)
);

CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_track ON applications(track_id);
CREATE INDEX IF NOT EXISTS idx_applications_program ON applications(program_id);
CREATE INDEX IF NOT EXISTS idx_applications_academic_year ON applications(academic_year);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS applicant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    verification_status VARCHAR(20) NOT NULL CHECK (
        verification_status IN ('pending', 'valid', 'invalid')
    ),
    verified_by UUID,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_document_applicant
        FOREIGN KEY (applicant_id) REFERENCES applicants(id),
    CONSTRAINT fk_document_verifier
        FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_applicant_documents_applicant ON applicant_documents(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applicant_documents_type ON applicant_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_applicant_documents_status ON applicant_documents(verification_status);

CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL,
    evaluation_type VARCHAR(30) NOT NULL CHECK (
        evaluation_type IN ('written_test', 'interview', 'academic_score', 'other')
    ),
    score NUMERIC(5,2),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_evaluation_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evaluations_application ON evaluations(application_id);

CREATE TABLE IF NOT EXISTS final_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE,
    result_status VARCHAR(20) NOT NULL CHECK (
        result_status IN ('passed', 'failed', 'waiting_list')
    ),
    final_score NUMERIC(6,2),
    decided_by UUID,
    decision_date TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_result_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_decider
        FOREIGN KEY (decided_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_final_results_status ON final_results(result_status);

CREATE TABLE IF NOT EXISTS re_registration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL UNIQUE,
    re_registration_date DATE NOT NULL,
    payment_status VARCHAR(20) NOT NULL CHECK (
        payment_status IN ('unpaid', 'paid')
    ),
    payment_proof TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reregistration_application
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_re_registration_payment_status ON re_registration(payment_status);


-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS re_registration;
DROP TABLE IF EXISTS final_results;
DROP TABLE IF EXISTS evaluations;
DROP TABLE IF EXISTS applicant_documents;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS study_programs;
DROP TABLE IF EXISTS faculties;
DROP TABLE IF EXISTS admission_tracks;
DROP TABLE IF EXISTS applicants;

DROP TYPE IF EXISTS degree_level_enum;
DROP TYPE IF EXISTS gender_enum;

-- +goose StatementEnd
