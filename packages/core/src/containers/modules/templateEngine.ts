import { TYPES } from '@vulcan-sql/core/containers';
import {
  ITemplateEngineOptions,
  TemplateProviderType,
} from '@vulcan-sql/core/models';
import {
  FileTemplateProvider,
  TemplateProvider,
  InMemoryCodeLoader,
  NunjucksCompiler,
  Compiler,
  TemplateEngine,
} from '@vulcan-sql/core/template-engine';
import { AsyncContainerModule, interfaces } from 'inversify';
import { TemplateEngineOptions } from '../../options';
import * as nunjucks from 'nunjucks';
// TODO: fix the path
import { bindExtensions } from '@vulcan-sql/core/template-engine/extension-loader';
import { ICodeLoader } from '@vulcan-sql/core/template-engine/code-loader';

export const templateEngineModule = (
  options: ITemplateEngineOptions,
  extensions: string[]
) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<ITemplateEngineOptions>(
      TYPES.TemplateEngineInputOptions
    ).toConstantValue(options);
    bind<ITemplateEngineOptions>(TYPES.TemplateEngineOptions)
      .to(TemplateEngineOptions)
      .inSingletonScope();

    // TemplateProvider
    bind<TemplateProvider>(TYPES.TemplateProvider)
      .to(FileTemplateProvider)
      .inSingletonScope()
      .whenTargetNamed(TemplateProviderType.LocalFile);

    bind<interfaces.AutoNamedFactory<TemplateProvider>>(
      TYPES.Factory_TemplateProvider
    ).toAutoNamedFactory<TemplateProvider>(TYPES.TemplateProvider);

    // Compiler environment
    bind<nunjucks.Environment>(TYPES.CompilerEnvironment)
      .toDynamicValue((context) => {
        // We only need loader in runtime
        const loader = context.container.get<nunjucks.ILoader>(
          TYPES.CompilerLoader
        );
        return new nunjucks.Environment(loader);
      })
      .inSingletonScope()
      .whenTargetNamed('runtime');
    bind<nunjucks.Environment>(TYPES.CompilerEnvironment)
      .toDynamicValue(() => {
        return new nunjucks.Environment();
      })
      .inSingletonScope()
      .whenTargetNamed('compileTime');

    // Loader
    bind<ICodeLoader>(TYPES.CompilerLoader)
      .to(InMemoryCodeLoader)
      .inSingletonScope();

    // Compiler
    bind<Compiler>(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();

    // Template Engine
    bind<TemplateEngine>(TYPES.TemplateEngine)
      .to(TemplateEngine)
      .inSingletonScope();

    // Load Extensions
    await bindExtensions(bind, extensions);
  });