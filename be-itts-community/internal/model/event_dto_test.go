package model

import "testing"

func TestEventRegistrationToResponsePrefersLandscapeImage(t *testing.T) {
	imageURL := "/events/legacy.png"
	squareURL := "/events/square.png"
	landscapeURL := "/events/landscape.png"

	reg := EventRegistration{
		ID:      "reg-1",
		EventID: "event-1",
		FullName: "Daisy",
		Email:   "daisy@example.com",
		Event: Event{
			Title:             "Programming",
			ImageURL:          &imageURL,
			SquareImageURL:    &squareURL,
			LandscapeImageURL: &landscapeURL,
		},
	}

	got := EventRegistrationToResponse(reg)

	if got.EventImageURL != landscapeURL {
		t.Fatalf("expected landscape image %q, got %q", landscapeURL, got.EventImageURL)
	}
}

func TestEventRegistrationToResponseFallsBackToSquareImage(t *testing.T) {
	imageURL := "/events/legacy.png"
	squareURL := "/events/square.png"

	reg := EventRegistration{
		ID:      "reg-1",
		EventID: "event-1",
		FullName: "Daisy",
		Email:   "daisy@example.com",
		Event: Event{
			Title:          "Programming",
			ImageURL:       &imageURL,
			SquareImageURL: &squareURL,
		},
	}

	got := EventRegistrationToResponse(reg)

	if got.EventImageURL != squareURL {
		t.Fatalf("expected square image %q, got %q", squareURL, got.EventImageURL)
	}
}

func TestEventRegistrationToResponseFallsBackToPrimaryImage(t *testing.T) {
	imageURL := "/events/legacy.png"

	reg := EventRegistration{
		ID:      "reg-1",
		EventID: "event-1",
		FullName: "Daisy",
		Email:   "daisy@example.com",
		Event: Event{
			Title:    "Programming",
			ImageURL: &imageURL,
		},
	}

	got := EventRegistrationToResponse(reg)

	if got.EventImageURL != imageURL {
		t.Fatalf("expected primary image %q, got %q", imageURL, got.EventImageURL)
	}
}
