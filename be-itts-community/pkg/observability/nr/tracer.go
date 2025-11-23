package nr

import (
    "context"
    "net/http"
)

// Tracer is a thin abstraction over New Relic to allow noop/test impls
type Tracer interface {
    StartWebTxn(name string, w http.ResponseWriter, r *http.Request) (context.Context, func())
    StartSegment(ctx context.Context, name string) func()
    StartDatastoreSegment(ctx context.Context, collection, operation string) func()
}

