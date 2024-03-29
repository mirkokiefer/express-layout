// Generated by CoffeeScript 1.3.3
(function() {
  var app, assert, assertEqualURLFile, assertView, consolidate, express, fs, hogan, http, layout, renderString, request, server, useBaseView, view;

  assert = require('assert');

  hogan = require('hogan.js');

  consolidate = require('consolidate');

  request = require('superagent');

  express = require('express');

  http = require('http');

  fs = require('fs');

  layout = require('../lib/layout');

  view = layout.view;

  renderString = function(template, data, cb) {
    return cb(null, (hogan.compile(template)).render(data));
  };

  useBaseView = function(req, res, next) {
    var head, headerData, rootView;
    rootView = view({
      template: "base.html",
      requires: ["head", "body"]
    });
    headerData = {
      js: [],
      css: ["/css/main.css"],
      title: "Default"
    };
    head = view({
      template: "head.html",
      data: function() {
        return headerData;
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
    rootView.subview('head', head);
    res.rootView(rootView);
    res.view('head', head);
    return next();
  };

  app = express.createServer();

  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.engine('html', consolidate.hogan);
    app.set('view engine', 'html');
    app.use(layout.middleware());
    return app.use(app.router);
  });

  app.get('/', useBaseView, function(req, res) {
    var head;
    head = res.view('head');
    head.title('Test');
    head.addJs(["/js/index.js"]);
    head.addCSS(["/css/index.css"]);
    res.rootView().subview('body', view({
      template: "{{a}}, {{b}}!",
      renderFun: renderString,
      data: {
        a: "hey",
        b: "ho"
      }
    }));
    return res.renderLayout();
  });

  app.get('/about', useBaseView, function(req, res) {
    var head;
    head = res.view('head');
    head.title('About');
    head.addCSS(["/css/about.css"]);
    res.rootView().subview('body', view({
      template: "about.html",
      data: function(cb) {
        return cb(null, {
          message: "We are awesome!"
        });
      }
    }));
    return res.renderLayout();
  });

  server = http.createServer(app).listen(5000);

  assertEqualURLFile = function(url, filePath, cb) {
    return request.get(url).end(function(res) {
      var expected;
      expected = fs.readFileSync(filePath, 'utf8');
      assert.equal(res.text, expected);
      return cb();
    });
  };

  assertView = function(urlPath, fileName, cb) {
    return assertEqualURLFile('http://localhost:5000' + urlPath, __dirname + '/expected-results/' + fileName, cb);
  };

  describe('layout.middleware', function() {
    return describe('render', function() {
      it('should render template string', function(done) {
        return assertView('/', 'index.html', done);
      });
      return it('should render about.html', function(done) {
        return assertView('/about', 'about.html', done);
      });
    });
  });

}).call(this);
