package midtrans

import (
	"bytes"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type Client struct {
	serverKey    string
	isProduction bool
	httpClient   *http.Client
}

type SnapTransactionRequest struct {
	TransactionDetails SnapTransactionDetails `json:"transaction_details"`
	CustomerDetails    SnapCustomerDetails    `json:"customer_details"`
	ItemDetails        []SnapItemDetail       `json:"item_details,omitempty"`
	Callbacks          *SnapCallbacks         `json:"callbacks,omitempty"`
}

type SnapTransactionDetails struct {
	OrderID     string `json:"order_id"`
	GrossAmount int64  `json:"gross_amount"`
}

type SnapCustomerDetails struct {
	FirstName string `json:"first_name,omitempty"`
	Email     string `json:"email,omitempty"`
	Phone     string `json:"phone,omitempty"`
}

type SnapItemDetail struct {
	ID       string `json:"id"`
	Price    int64  `json:"price"`
	Quantity int    `json:"quantity"`
	Name     string `json:"name"`
}

type SnapCallbacks struct {
	Finish   string `json:"finish,omitempty"`
	Unfinish string `json:"unfinish,omitempty"`
	Error    string `json:"error,omitempty"`
}

type SnapTransactionResponse struct {
	Token       string `json:"token"`
	RedirectURL string `json:"redirect_url"`
}

func NewClient(serverKey string, isProduction bool) *Client {
	return &Client{
		serverKey:    serverKey,
		isProduction: isProduction,
		httpClient:   &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) CreateSnapTransaction(req SnapTransactionRequest) (*SnapTransactionResponse, error) {
	body, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	httpReq, err := http.NewRequest(http.MethodPost, c.baseURL()+"/snap/v1/transactions", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(c.serverKey+":")))

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("midtrans snap request failed with status %d: %s", resp.StatusCode, strings.TrimSpace(string(respBody)))
	}

	var out SnapTransactionResponse
	if err := json.Unmarshal(respBody, &out); err != nil {
		return nil, err
	}
	return &out, nil
}

func (c *Client) VerifyWebhookSignature(orderID, statusCode, grossAmount, signature string) bool {
	sum := sha512.Sum512([]byte(orderID + statusCode + grossAmount + c.serverKey))
	expected := hex.EncodeToString(sum[:])
	return strings.EqualFold(expected, signature)
}

func (c *Client) baseURL() string {
	if c.isProduction {
		return "https://app.midtrans.com"
	}
	return "https://app.sandbox.midtrans.com"
}
