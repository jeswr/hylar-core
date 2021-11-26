import type { BaseQuad, Term } from 'rdf-js';
import { termToString } from 'rdf-string';

export interface Mapping {
  __facts__: [];
  [key: string]: Term | [];
}

export default class Fact {
  private asString: string;

  public mapping?: Mapping;

  constructor(
    public quad: BaseQuad | false,
    public explicit = true,
    public causedBy: Fact[][] = [],
  ) {
    this.asString = `${this.explicit ? 'E' : 'I'}${this.quad ? termToString(this.quad) : 'FALSE'}`;
  }

  toString() {
    return this.asString;
  }
}
