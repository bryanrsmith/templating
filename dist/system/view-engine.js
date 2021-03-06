System.register(["aurelia-logging", "aurelia-loader", "./view-compiler", "./resource-registry"], function (_export) {
  var LogManager, Loader, ViewCompiler, ResourceRegistry, ViewResources, _prototypeProperties, _classCallCheck, logger, ViewEngine;

  return {
    setters: [function (_aureliaLogging) {
      LogManager = _aureliaLogging;
    }, function (_aureliaLoader) {
      Loader = _aureliaLoader.Loader;
    }, function (_viewCompiler) {
      ViewCompiler = _viewCompiler.ViewCompiler;
    }, function (_resourceRegistry) {
      ResourceRegistry = _resourceRegistry.ResourceRegistry;
      ViewResources = _resourceRegistry.ViewResources;
    }],
    execute: function () {
      "use strict";

      _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

      logger = LogManager.getLogger("templating");
      ViewEngine = _export("ViewEngine", (function () {
        function ViewEngine(loader, viewCompiler, appResources) {
          _classCallCheck(this, ViewEngine);

          this.loader = loader;
          this.viewCompiler = viewCompiler;
          this.appResources = appResources;
        }

        _prototypeProperties(ViewEngine, {
          inject: {
            value: function inject() {
              return [Loader, ViewCompiler, ResourceRegistry];
            },
            writable: true,
            configurable: true
          }
        }, {
          loadViewFactory: {
            value: function loadViewFactory(url, compileOptions, associatedModuleId) {
              var _this = this;

              return this.loader.loadTemplate(url).then(function (viewRegistryEntry) {
                if (viewRegistryEntry.isReady) {
                  return viewRegistryEntry.factory;
                }

                return _this.loadTemplateResources(viewRegistryEntry, associatedModuleId).then(function (resources) {
                  if (viewRegistryEntry.isReady) {
                    return viewRegistryEntry.factory;
                  }

                  viewRegistryEntry.setResources(resources);

                  var viewFactory = _this.viewCompiler.compile(viewRegistryEntry.template, resources, compileOptions);
                  viewRegistryEntry.setFactory(viewFactory);
                  return viewFactory;
                });
              });
            },
            writable: true,
            configurable: true
          },
          loadTemplateResources: {
            value: function loadTemplateResources(viewRegistryEntry, associatedModuleId) {
              var _this = this;

              var resources = new ViewResources(this.appResources, viewRegistryEntry.id),
                  dependencies = viewRegistryEntry.dependencies,
                  associatedModule,
                  importIds,
                  i,
                  ii;

              if (dependencies.length === 0 && !associatedModuleId) {
                return Promise.resolve(resources);
              }

              importIds = dependencies.map(function (x) {
                return x.src;
              });
              logger.debug("importing resources for " + viewRegistryEntry.id, importIds);

              return this.resourceCoordinator.importResourcesFromModuleIds(importIds).then(function (toRegister) {
                for (i = 0, ii = toRegister.length; i < ii; ++i) {
                  toRegister[i].register(resources, dependencies[i].name);
                }

                if (associatedModuleId) {
                  associatedModule = _this.resourceCoordinator.getExistingModuleAnalysis(associatedModuleId);

                  if (associatedModule) {
                    associatedModule.register(resources);
                  }
                }

                return resources;
              });
            },
            writable: true,
            configurable: true
          }
        });

        return ViewEngine;
      })());
    }
  };
});