package nr

import (
	"context"
	"net/http"

	newrelic "github.com/newrelic/go-agent/v3/newrelic"
)

type NRTracer struct {
	App *newrelic.Application
}

func NewNRTracer(app *newrelic.Application) Tracer { return &NRTracer{App: app} }

func (t *NRTracer) StartWebTxn(name string, w http.ResponseWriter, r *http.Request) (context.Context, func()) {
	if t == nil || t.App == nil {
		return r.Context(), func() {}
	}
	txn := t.App.StartTransaction(name)
	txn.SetWebRequestHTTP(r)
	if w != nil {
		w = txn.SetWebResponse(w)
	}
    ctx := newrelic.NewContext(r.Context(), txn)
    return ctx, func() { txn.End() }
}

func (t *NRTracer) StartSegment(ctx context.Context, name string) func() {
	if txn := newrelic.FromContext(ctx); txn != nil {
		seg := txn.StartSegment(name)
		return seg.End
	}
	return func() {}
}

func (t *NRTracer) StartDatastoreSegment(ctx context.Context, collection, operation string) func() {
	if txn := newrelic.FromContext(ctx); txn != nil {
		seg := newrelic.DatastoreSegment{
			Product:    newrelic.DatastorePostgres,
			Collection: collection,
			Operation:  operation,
			StartTime:  txn.StartSegmentNow(),
		}
		return seg.End
	}
	return func() {}
}
