"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActorQueryOperationProject = void 0;
const bus_query_operation_1 = require("@comunica/bus-query-operation");
const data_factory_1 = require("@comunica/data-factory");
const rdf_data_factory_1 = require("rdf-data-factory");
const rdf_string_1 = require("rdf-string");
const DF = new rdf_data_factory_1.DataFactory();
/**
 * A comunica Project Query Operation Actor.
 */
class ActorQueryOperationProject extends bus_query_operation_1.ActorQueryOperationTypedMediated {
    constructor(args) {
        super(args, 'project');
    }
    async testOperation(pattern, context) {
        return true;
    }
    async runOperation(pattern, context) {
        // Resolve the input
        const output = bus_query_operation_1.ActorQueryOperation.getSafeBindings(await this.mediatorQueryOperation.mediate({ operation: pattern.input, context }));
        // Find all variables that should be deleted from the input stream.
        const variables = pattern.variables.map(x => rdf_string_1.termToString(x));
        const deleteVariables = output.variables.filter(variable => !variables.includes(variable));
        // Error if there are variables that are not bound in the input stream.
        const missingVariables = variables.filter(variable => !output.variables.includes(variable));
        if (missingVariables.length > 0) {
            throw new Error(`Variables '${missingVariables}' are used in the projection result, but are not assigned.`);
        }
        // Make sure the project variables are the only variables that are present in the bindings.
        let bindingsStream = deleteVariables.length === 0 ?
            output.bindingsStream :
            output.bindingsStream.transform({
                map(bindings) {
                    for (const deleteVariable of deleteVariables) {
                        bindings = bindings.delete(deleteVariable);
                    }
                    return bindings;
                },
                autoStart: false,
            });
        // Make sure that blank nodes with same labels are not reused over different bindings, as required by SPARQL 1.1.
        // Required for the BNODE() function: https://www.w3.org/TR/sparql11-query/#func-bnode
        // When we have a scoped blank node, make sure the skolemized value is maintained.
        let blankNodeCounter = 0;
        bindingsStream = bindingsStream.transform({
            map(bindings) {
                blankNodeCounter++;
                return bindings.map(term => {
                    if (term && term.termType === 'BlankNode') {
                        if (term instanceof data_factory_1.BlankNodeScoped) {
                            return new data_factory_1.BlankNodeScoped(`${term.value}${blankNodeCounter}`, term.skolemized);
                        }
                        return DF.blankNode(`${term.value}${blankNodeCounter}`);
                    }
                    return term;
                });
            },
            autoStart: false,
        });
        return {
            type: 'bindings',
            bindingsStream,
            metadata: output.metadata,
            variables,
            canContainUndefs: output.canContainUndefs,
        };
    }
}
exports.ActorQueryOperationProject = ActorQueryOperationProject;
//# sourceMappingURL=ActorQueryOperationProject.js.map