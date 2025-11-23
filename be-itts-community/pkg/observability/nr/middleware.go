package nr

import (
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
)

// Middleware starts a web transaction for each request
func Middleware(t Tracer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			routePattern := middleware.RoutePattern(r)
			if routePattern == "" {
				routePattern = r.URL.Path
			}
			name := r.Method + " " + routePattern
			ctx, end := t.StartWebTxn(name, w, r)
			defer end()
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
