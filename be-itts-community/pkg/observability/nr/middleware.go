package nr

import (
    "net/http"

    "github.com/go-chi/chi/v5"
)

// Middleware starts a web transaction for each request
func Middleware(t Tracer) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            routePattern := r.URL.Path
            if rctx := chi.RouteContext(r.Context()); rctx != nil {
                if pat := rctx.RoutePattern(); pat != "" {
                    routePattern = pat
                }
            }
            name := r.Method + " " + routePattern
            ctx, end := t.StartWebTxn(name, w, r)
            defer end()
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}
