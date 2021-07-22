import type { BaseQuad, Quad } from 'rdf-js';
import { termToString } from 'rdf-string';

export default class Fact {
  private asString: string;

  constructor(
    public quad: BaseQuad | false,
    public explicit = true,
    public causedBy: Fact[][] = [],
    public consequences: Fact[] = [],
  ) {
    this.asString = `${this.explicit ? 'E' : 'I'}${this.quad ? termToString(this.quad) : 'FALSE'}`;
  }

  toString() {
    return this.asString;
  }
}
