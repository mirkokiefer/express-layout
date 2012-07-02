assert = require 'assert'
hogan = require 'hogan.js'
consolidate = require 'consolidate'
request = require 'superagent'
express = require 'express'
http = require 'http'
fs = require 'fs'

layout = require '../lib/layout'

useBaseView = (req, res, next) ->
  res.rootView
    template: "base.html"
    requires: ["head", "body"]

  headerData = js: [], css: ["/css/main.css"], title: "Default"
  res.view 'head',
    template: "head.html"
    data: (cb) -> cb null, headerData
    addJs: (js) -> headerData.js = headerData.js.concat js
    addCSS: (css) -> headerData.css = headerData.css.concat css
    title: (title) -> headerData.title = title
  next()

app = express.createServer()
# Configuration
app.configure () ->
  app.set 'views', __dirname + '/views'
  app.engine 'html', consolidate.hogan
  app.set 'view engine', 'html'
  app.use layout()
  app.use app.router

app.get '/', useBaseView, (req, res) ->
  head = res.view 'head'
  head.title 'Test'
  head.addJs ["/js/index.js"]
  head.addCSS ["/css/index.css"]
  res.view 'body',
    template: "index.html"
    data: (cb) -> cb null, a: "hey", b: "ho"
  res.renderLayout()

app.get '/about', useBaseView, (req, res) ->
  head = res.view 'head'
  head.title 'About'
  head.addCSS ["/css/about.css"]
  res.view 'body',
    template: "about.html"
    data: (cb) -> cb null, message: "We are awesome!"
  res.renderLayout()

server = http.createServer(app).listen 5000


assertEqualURLFile = (url, filePath, cb) ->
  request.get(url).end (res) ->
    expected = fs.readFileSync filePath, 'utf8'
    assert.equal res.text, expected
    cb()

assertView = (urlPath, fileName, cb) ->
  assertEqualURLFile 'http://localhost:5000' + urlPath,  __dirname + '/expected-results/' + fileName, cb

describe 'layout', () ->
  describe 'render', () ->
    it 'should render index.html', (done) -> assertView '/', 'index.html', done
    it 'should render about.html', (done) -> assertView '/about', 'about.html', done
