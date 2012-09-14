document = require("jsdom").jsdom("<html><head></head><body></body></html>");
window = document.createWindow();
navigator = window.navigator;

CSSStyleDeclaration = window.CSSStyleDeclaration;

require("sizzle");
Sizzle = window.Sizzle;

process.env.TZ = "UTC";
require("./env-xhr");
cal = require('../lib/compairlines.js');