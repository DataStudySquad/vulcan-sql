import { ICoreOptions } from '@vulcan/core/models';
import { Container as InversifyContainer } from 'inversify';
import {
  artifactBuilderModule,
  executorModule,
  templateEngineModule,
  validatorLoaderModule,
} from './modules';

export class Container {
  private inversifyContainer = new InversifyContainer();

  public get<T>(type: symbol) {
    return this.inversifyContainer.get<T>(type);
  }

  public async load(options: ICoreOptions) {
    this.inversifyContainer.load(artifactBuilderModule(options.artifact));
    this.inversifyContainer.load(executorModule());
    await this.inversifyContainer.loadAsync(
      templateEngineModule(options.template)
    );
    this.inversifyContainer.load(validatorLoaderModule(options.extensions));
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
