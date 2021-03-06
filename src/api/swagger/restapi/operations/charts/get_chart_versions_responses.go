package charts

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the swagger generate command

import (
	"net/http"

	"github.com/go-openapi/runtime"

	"github.com/helm/monocular/src/api/swagger/models"
)

/*GetChartVersionsOK chart response

swagger:response getChartVersionsOK
*/
type GetChartVersionsOK struct {

	// In: body
	Payload *models.ResourceData `json:"body,omitempty"`
}

// NewGetChartVersionsOK creates GetChartVersionsOK with default headers values
func NewGetChartVersionsOK() *GetChartVersionsOK {
	return &GetChartVersionsOK{}
}

// WithPayload adds the payload to the get chart versions o k response
func (o *GetChartVersionsOK) WithPayload(payload *models.ResourceData) *GetChartVersionsOK {
	o.Payload = payload
	return o
}

// SetPayload sets the payload to the get chart versions o k response
func (o *GetChartVersionsOK) SetPayload(payload *models.ResourceData) {
	o.Payload = payload
}

// WriteResponse to the client
func (o *GetChartVersionsOK) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.WriteHeader(200)
	if o.Payload != nil {
		if err := producer.Produce(rw, o.Payload); err != nil {
			panic(err) // let the recovery middleware deal with this
		}
	}
}

/*GetChartVersionsDefault unexpected error

swagger:response getChartVersionsDefault
*/
type GetChartVersionsDefault struct {
	_statusCode int

	// In: body
	Payload *models.Error `json:"body,omitempty"`
}

// NewGetChartVersionsDefault creates GetChartVersionsDefault with default headers values
func NewGetChartVersionsDefault(code int) *GetChartVersionsDefault {
	if code <= 0 {
		code = 500
	}

	return &GetChartVersionsDefault{
		_statusCode: code,
	}
}

// WithStatusCode adds the status to the get chart versions default response
func (o *GetChartVersionsDefault) WithStatusCode(code int) *GetChartVersionsDefault {
	o._statusCode = code
	return o
}

// SetStatusCode sets the status to the get chart versions default response
func (o *GetChartVersionsDefault) SetStatusCode(code int) {
	o._statusCode = code
}

// WithPayload adds the payload to the get chart versions default response
func (o *GetChartVersionsDefault) WithPayload(payload *models.Error) *GetChartVersionsDefault {
	o.Payload = payload
	return o
}

// SetPayload sets the payload to the get chart versions default response
func (o *GetChartVersionsDefault) SetPayload(payload *models.Error) {
	o.Payload = payload
}

// WriteResponse to the client
func (o *GetChartVersionsDefault) WriteResponse(rw http.ResponseWriter, producer runtime.Producer) {

	rw.WriteHeader(o._statusCode)
	if o.Payload != nil {
		if err := producer.Produce(rw, o.Payload); err != nil {
			panic(err) // let the recovery middleware deal with this
		}
	}
}
