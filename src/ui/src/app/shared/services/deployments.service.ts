import { Injectable } from '@angular/core';
import { Deployment } from '../models/deployment';
import { ConfigService } from './config.service';

import { Observable } from 'rxjs';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/find';
import 'rxjs/add/operator/map';
var jsyaml = require('js-yaml')

import { Http, Response } from '@angular/http';

function svc2urls(doc, ret) {
  var name = null
  var spec = doc.spec
  if (!doc.spec)
    return

  var nodeIP = "fs66-b-app"
  var ip = nodeIP
  var extIP = spec.externalIPs
  for (var port of spec.ports) {
    var nodePort = port.nodePort
    if (nodePort) {
      ret.push(`http://${nodeIP}:${nodePort}`)
    }
    if (extIP) {
      ret.push(`http://${extIP}:${port.port}`)
    }
  }
}

function yaml2urls(yamlStr) {
  var ret = []
  var name = null
  jsyaml.safeLoadAll(yamlStr, function (doc) {
    if (doc.kind != "Service")
      return
    svc2urls(doc, ret)
  })
  return ret
}

/* TODO, This is a mocked class. */
@Injectable()
export class DeploymentsService {
  hostname: string;

  constructor(
    private http: Http,
    private config: ConfigService
  ) {
    this.hostname = config.backendHostname;
  }

  getDeployments(): Observable<Deployment[]> {
      return this.http.get(`${this.hostname}/v1/releases`)
                    .map((response) => {
                      return this.extractData(response, [])
                    }).catch(this.handleError);
  }

  getDeployment(deploymentName: string): Observable<Deployment> {
      return this.http.get(`${this.hostname}/v1/releases/${deploymentName}`)
                    .map((response) => {
                      return this.extractData(response, [])
                    }).catch(this.handleError);
  }

  installDeployment(chartID: string, version: string): Observable<Deployment> {
      var params = { "chartId": chartID, "chartVersion": version }
      return this.http.post(`${this.hostname}/v1/releases`, params)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  deleteDeployment(deploymentName: string): Observable<Deployment> {
    return this.http.delete(`${this.hostname}/v1/releases/${deploymentName}`)
                    .map(this.extractData)
                    .catch(this.handleError);
  }

  private extractData(res: Response, fallback = {}) {
    let body = res.json();
    var data = body.data
    if (!data) {
        return fallback
    }
    var attributes = data.attributes
    if (attributes) {
      var manifest = attributes.manifest
      if (manifest) {
        console.log(manifest)
        attributes.urls = yaml2urls(manifest)
      }
      console.log(data)
    }
    return data || fallback;
  }

  private handleError (error: any) {
    error = error.json();
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}
