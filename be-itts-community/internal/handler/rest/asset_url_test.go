package rest

import (
	"net/http/httptest"
	"testing"

	"be-itts-community/internal/model"
)

func TestBuildAbsoluteAssetURL(t *testing.T) {
	t.Run("uses default storage base for relative path", func(t *testing.T) {
		t.Setenv("ASSET_BASE_URL", "")
		t.Setenv("ASSET_BUCKET", "")

		got := buildAbsoluteAssetURL(httptest.NewRequest("GET", "http://api.local", nil), "/mentors/networking.jpg")

		want := "https://storage.itts.fun/itts/mentors/networking.jpg"
		if got != want {
			t.Fatalf("expected %q, got %q", want, got)
		}
	})

	t.Run("uses env override for relative path", func(t *testing.T) {
		t.Setenv("ASSET_BASE_URL", "https://cdn.example.com/assets/")
		t.Setenv("ASSET_BUCKET", "itts")

		got := buildAbsoluteAssetURL(httptest.NewRequest("GET", "http://api.local", nil), "partners/logo.png")

		want := "https://cdn.example.com/assets/itts/partners/logo.png"
		if got != want {
			t.Fatalf("expected %q, got %q", want, got)
		}
	})

	t.Run("keeps absolute url unchanged", func(t *testing.T) {
		t.Setenv("ASSET_BASE_URL", "https://cdn.example.com")

		got := buildAbsoluteAssetURL(httptest.NewRequest("GET", "http://api.local", nil), "https://images.example.com/banner.jpg")

		want := "https://images.example.com/banner.jpg"
		if got != want {
			t.Fatalf("expected %q, got %q", want, got)
		}
	})
}

func TestWithAbsoluteEventImageURL(t *testing.T) {
	t.Setenv("ASSET_BASE_URL", "https://storage.itts.fun")
	t.Setenv("ASSET_BUCKET", "itts")

	req := httptest.NewRequest("GET", "http://api.local", nil)
	event := model.EventResponse{
		ImageURL:          "/events/community-night.jpg",
		SquareImageURL:    "/events/community-night-square.jpg",
		LandscapeImageURL: "/events/community-night-landscape.jpg",
		Speakers: []model.SpeakerResponse{
			{
				Name:      "Bagas",
				AvatarURL: "/speakers/bagas.jpg",
			},
			{
				Name:      "Dina",
				AvatarURL: "https://avatars.example.com/dina.jpg",
			},
		},
	}

	got := withAbsoluteEventImageURL(req, event)

	if got.FilePath != "/events/community-night.jpg" {
		t.Fatalf("expected file_path to keep original relative asset path, got %q", got.FilePath)
	}
	if got.SquareFilePath != "/events/community-night-square.jpg" {
		t.Fatalf("expected square_file_path to keep original relative asset path, got %q", got.SquareFilePath)
	}
	if got.LandscapeFilePath != "/events/community-night-landscape.jpg" {
		t.Fatalf("expected landscape_file_path to keep original relative asset path, got %q", got.LandscapeFilePath)
	}

	if got.ImageURL != "https://storage.itts.fun/itts/events/community-night.jpg" {
		t.Fatalf("unexpected image_url: %q", got.ImageURL)
	}
	if got.SquareImageURL != "https://storage.itts.fun/itts/events/community-night-square.jpg" {
		t.Fatalf("unexpected square_image_url: %q", got.SquareImageURL)
	}
	if got.LandscapeImageURL != "https://storage.itts.fun/itts/events/community-night-landscape.jpg" {
		t.Fatalf("unexpected landscape_image_url: %q", got.LandscapeImageURL)
	}
	if got.Speakers[0].AvatarURL != "https://storage.itts.fun/itts/speakers/bagas.jpg" {
		t.Fatalf("unexpected speaker avatar_url: %q", got.Speakers[0].AvatarURL)
	}
	if got.Speakers[1].AvatarURL != "https://avatars.example.com/dina.jpg" {
		t.Fatalf("expected absolute speaker avatar_url to remain unchanged, got %q", got.Speakers[1].AvatarURL)
	}
}
