async = require 'async'
utils = require 'livelyutils'

render = (name, views, defaultRenderFun, cb) ->
  view = views[name]
  data = if view.data then view.data else (cb) -> cb null, {}
  requires = if view.requires then view.requires else []
  renderFun = if view.renderFun then view.renderFun else defaultRenderFun
  mapRequired = (viewName, cb) -> render viewName, views, defaultRenderFun, cb
  renderRequired = (cb) ->
    async.map requires, mapRequired, (err, renderedViews) ->
      mapping = {}
      (mapping[name]=renderedViews[i]) for name, i in requires
      cb null, mapping
  evalData = (cb) -> utils.ensure data, cb
  async.parallel [evalData, renderRequired], (err, [data, required]) ->
    mergedData = utils.merge data, required
    renderFun view.template, mergedData, cb

layout = (renderFun) -> (req, res, next) ->
  renderFun = if renderFun then renderFun else (view, options, cb) -> res.render view, options, cb
  res.views = {}
  res.view = (name, view) ->
    if view then res.views[name] = view else res.views[name]
  res.rootView = (view) -> res.view 'root', view
  res.renderLayout = () ->
    if res.views
      render 'root', res.views, renderFun, (err, html) ->
        res.send html
  next()

module.exports = layout