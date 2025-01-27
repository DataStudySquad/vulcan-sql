import {
  FilterBuilder,
  FilterRunner,
  FilterRunnerTransformOptions,
} from '../../models/extensions';
import { ClassType } from '../utils';
import { NunjucksExecutionMetadata } from '../template-engine/nunjucksExecutionMetadata';

export interface FunctionalFilterOptions {
  value: any;
  args: Record<string, any>;
  metadata: NunjucksExecutionMetadata;
}

export type FunctionalFilter = (
  options: FunctionalFilterOptions
) => Promise<string>;

export const createFilterExtension = (
  name: string,
  functionalFilter: FunctionalFilter
): [ClassType<FilterBuilder>, ClassType<FilterRunner>] => {
  class Builder extends FilterBuilder {
    public filterName = name;
  }

  class Runner extends FilterRunner {
    public filterName = name;

    public transform(options: FilterRunnerTransformOptions<any>): Promise<any> {
      return functionalFilter({
        value: options.value,
        args: options.args[0],
        metadata: options.metadata,
      });
    }
  }
  return [Builder, Runner];
};
