import * as LogManager from 'aurelia-logging';
import {Loader} from 'aurelia-loader';
import {ViewCompiler} from './view-compiler';
import {ResourceRegistry, ViewResources} from './resource-registry';

var logger = LogManager.getLogger('templating');

export class ViewEngine {
  static inject() { return [Loader, ViewCompiler, ResourceRegistry]; }
	constructor(loader, viewCompiler, appResources){
		this.loader = loader;
		this.viewCompiler = viewCompiler;
    this.appResources = appResources;
	}

	loadViewFactory(url, compileOptions, associatedModuleId){
    return this.loader.loadTemplate(url).then(viewRegistryEntry => {
      if(viewRegistryEntry.isReady){
        return viewRegistryEntry.factory;
      }

      return this.loadTemplateResources(viewRegistryEntry, associatedModuleId).then(resources => {
        if(viewRegistryEntry.isReady){
          return viewRegistryEntry.factory;
        }

        viewRegistryEntry.setResources(resources);

        var viewFactory = this.viewCompiler.compile(viewRegistryEntry.template, resources, compileOptions);
        viewRegistryEntry.setFactory(viewFactory);
        return viewFactory;
      });
    });
  }

  loadTemplateResources(viewRegistryEntry, associatedModuleId){
    var resources = new ViewResources(this.appResources, viewRegistryEntry.id),
        dependencies = viewRegistryEntry.dependencies,
        associatedModule, importIds, i, ii;

    if(dependencies.length === 0 && !associatedModuleId){
      return Promise.resolve(resources);
    }

    importIds = dependencies.map(x => x.src);
    logger.debug(`importing resources for ${viewRegistryEntry.id}`, importIds);

    return this.resourceCoordinator.importResourcesFromModuleIds(importIds).then(toRegister => {
      for(i = 0, ii = toRegister.length; i < ii; ++i){
        toRegister[i].register(resources, dependencies[i].name);
      }

      if(associatedModuleId){
        associatedModule = this.resourceCoordinator.getExistingModuleAnalysis(associatedModuleId);

        if(associatedModule){
          associatedModule.register(resources);
        }
      }

      return resources;
    });
  }
}
