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

function yaml2urls(yamlStr, ret) {
  var name = null
  jsyaml.safeLoadAll(yamlStr, function (doc) {
    if (doc.kind != "Service")
      return
    svc2urls(doc, ret)
  })
}

var portsRE = /^(\d+:)?(\d+)\/TCP$/
var ipRE = /^\d+\.\d+\.\d+\.\d+$/

var NODE_IP = "10.19.66.145"

function txt_svc2urls(portSpec, ret) {
  var EXT_IP = "EXTERNAL-IP"
  var ports = portSpec['PORT(S)'].split(",")
  ports.forEach(port => {
    var match = portsRE.exec(port)
    if (match) {
      if (match[1]) { // if the form is INTERN_PORT:EXT_PORT/TCP
        var protocol = match[1] == '443:' ? 'https' : 'http'
        ret.push(`${protocol}://${NODE_IP}:${match[2]}`)
      } else if (ipRE.exec(portSpec[EXT_IP])) {
        ret.push("http://" + portSpec[EXT_IP] + ":" + match[2])
      }
    } else {
      console.error("Can't parse", port)
    }
  })
}

function resources_2_urls(str, ret) {
  var ls = str.split("==> ")
  ls.forEach(x => {
    var details = x.split('\n')
    if (details.shift() != 'v1/Service')
      return
    var header = details.shift().split(/ +/)
    var data = null
    while (data = details.shift()) {
      data = data.split(/ +/)
      var parsed = {}
      for (var i = 0; i < header.length; i++) {
        parsed[header[i]] = data[i]
      }
      txt_svc2urls(parsed, ret)
    }
  })
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
      attributes.urls = []
      var resources = attributes.resources
      if (resources)
        resources_2_urls(resources, attributes.urls)
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
