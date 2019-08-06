#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpServiceSparqlEndpoint_1 = require("../lib/HttpServiceSparqlEndpoint");
const defaultConfigPath = __dirname + '/../config/config-default.json';
HttpServiceSparqlEndpoint_1.HttpServiceSparqlEndpoint.runArgsInProcess(process.argv.slice(2), process.stdout, process.stderr, __dirname + '/../', process.env, defaultConfigPath, (code) => process.exit(code));
//# sourceMappingURL=http.js.map