System.config({
  "baseURL": "/",
  "transpiler": "traceur",
  "paths": {
    "*": "*.js",
    "github:*": "src/js/jspm_packages/github/*.js",
    "npm:*": "src/js/jspm_packages/npm/*.js"
  },
  "bundles": {
    "build/main": [
      "src/js/main"
    ]
  }
});

System.config({
  "map": {
    "ded/reqwest": "github:ded/reqwest@1.1.5",
    "guardian/iframe-messenger": "github:guardian/iframe-messenger@master",
    "json": "github:systemjs/plugin-json@0.1.0",
    "moment/moment": "github:moment/moment@2.10.3",
    "ractivejs/ractive": "github:ractivejs/ractive@0.7.3",
    "reqwest": "github:ded/reqwest@1.1.5",
    "taijinlee/humanize": "github:taijinlee/humanize@0.0.9",
    "text": "github:systemjs/plugin-text@0.0.2",
    "traceur": "github:jmcriffey/bower-traceur@0.0.88",
    "traceur-runtime": "github:jmcriffey/bower-traceur-runtime@0.0.88"
  }
});

