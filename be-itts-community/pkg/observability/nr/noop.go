package nr

import (
    "context"
    "net/http"
)

type noopTracer struct{}

func NewNoopTracer() Tracer { return &noopTracer{} }

func (n *noopTracer) StartWebTxn(name string, w http.ResponseWriter, r *http.Request) (context.Context, func()) {
    return r.Context(), func() {}
}
func (n *noopTracer) StartSegment(ctx context.Context, name string) func() { return func() {} }
func (n *noopTracer) StartDatastoreSegment(ctx context.Context, collection, operation string) func() {
    return func() {}
}

