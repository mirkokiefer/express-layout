async = require 'async'
utils = require 'livelyutils'

render = (view, defaultRenderFun, cb) ->
  data = if view.data then view.data else (cb) -> cb null, {}
  renderFun = if view.renderFun then view.renderFun else defaultRenderFun
  renderRequired = (cb) ->
    mapRequired = (name, view, cb) -> render view, defaultRenderFun, cb
    utils.mapObject view.subviews(), mapRequired, cb
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
      render res.rootView(), renderFun, (err, html) ->
        res.send html
  next()

view = (config) ->
  subviews = {}
  config.subviews = () -> subviews
  config.subview = (name, view) -> if view then subviews[name] = view else subviews[name]
  config

module.exports =
  middleware: layout
  view: view