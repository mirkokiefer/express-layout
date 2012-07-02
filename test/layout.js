// Generated by CoffeeScript 1.3.3
(function() {
  var app, assert, consolidate, express, fs, hogan, http, layout, request, useBaseView;

  assert = require('assert');

  hogan = require('hogan.js');

  consolidate = require('consolidate');

  request = require('superagent');

  express = require('express');

  http = require('http');

  fs = require('fs');

  layout = require('../lib/layout');

  useBaseView = function(req, res, next) {
    var headerData;
    res.rootView({
      template: "base.html",
      requires: ["head", "body"]
    });
    headerData = {
      js: [],
      css: ["/css/main.css"],
      title: "Default"
    };
    res.view('head', {
      template: "head.html",
      data: function(cb) {
        return cb(null, headerData);
      },
      addJs: function(js) {
        return headerData.js = headerData.js.concat(js);
      },
      addCSS: function(css) {
        return headerData.css = headerData.css.concat(css);
      },
      title: function(title) {
        return headerData.title = title;
      }
    });
    return next();
  };

  app = express.createServer();

  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.engine('html', consolidate.hogan);
    app.set('view engine', 'html');
    app.use(layout());
    return app.use(app.router);
  });

  app.get('/', useBaseView, function(req, res) {
    var head;
    head = res.view('head');
    head.title('Test');
    head.addJs(["/js/index.js"]);
    head.addCSS(["/css/index.css"]);
    res.view('body', {
      template: "index.html",
      data: function(cb) {
        return cb(null, {
          a: "hey",
          b: "ho"
        });
      }
    });
    return res.renderLayout();
  });

  app.get('/about', useBaseView, function(req, res) {
    var head;
    head = res.view('head');
    head.title('About');
    head.addCSS(["/css/about.css"]);
    res.view('body', {
      template: "about.html",
      data: function(cb) {
        return cb(null, {
          message: "We are awesome!"
        });
      }
    });
    return res.renderLayout();
  });

  http.createServer(app).listen(5000);

  describe('layout', function() {
    return describe('render', function() {
      it('should render index.html', function(done) {
        return request.get('http://localhost:5000/').end(function(res) {
          var expected;
          expected = fs.readFileSync(__dirname + '/expected-results/index.html', 'utf8');
          assert.equal(res.text, expected);
          return done();
        });
      });
      return it('should render about.html', function(done) {
        return request.get('http://localhost:5000/about').end(function(res) {
          var expected;
          expected = fs.readFileSync(__dirname + '/expected-results/about.html', 'utf8');
          assert.equal(res.text, expected);
          return done();
        });
      });
    });
  });

}).call(this);