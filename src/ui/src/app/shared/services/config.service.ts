import { Injectable } from '@angular/core';

@Injectable()
export class ConfigService {
  // Configurable options
  // They can be overriden using assets/js/overrides.js
  backendHostname: string
  appName: string
  releasesEnabled: boolean
  // EO configurable options

  constructor() {
    var overrides: any = {}
    if (window["monocular"]) {
      overrides = window["monocular"]["overrides"] || {};
    }

    this.backendHostname = overrides.backendHostname || "http://" + window.location.hostname + ":31983"
    this.appName = overrides.appName || "Monocular";
    this.releasesEnabled = overrides.releasesEnabled;
  }
}
