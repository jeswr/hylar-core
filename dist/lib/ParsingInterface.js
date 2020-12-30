"use strict";
// @ts-nocheck
/*
 * Created by MT on 20/11/2015.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factsToQuads = exports.triplesToFacts = exports.tripleToFact = void 0;
const data_model_1 = require("@rdfjs/data-model");
const Fact_1 = __importDefault(require("./Logics/Fact"));
/**
 * The parsing interface, for transforming facts, triples, turtle or even results bindings
 * into other representations.
 * The SPARQL parser oddly transforms prefixed typed literal without angle brackets (!).
 * This should fix it.
 */
/**
  * Transforms a triple into a fact.
  * @param t The triple
  * @param explicit True if the resulting fact is explicit, false otherwise (default: true)
  * @returns Object resulting fact
  */
function tripleToFact(t, explicit = true) {
    return new Fact_1.default(t.predicate.value, t.subject.value, t.object.value, [], explicit, t.graph.value ? [t.graph] : []);
}
exports.tripleToFact = tripleToFact;
function triplesToFacts(t, explicit = true, notUsingValid) {
    return t.map((triple) => tripleToFact(triple, explicit, notUsingValid));
}
exports.triplesToFacts = triplesToFacts;
function factsToQuads(facts) {
    const implicit = [];
    const explicit = [];
    for (const fact of facts) {
        if (fact.graphs.length > 0) {
            for (const graph of fact.graphs) {
                if (fact.explicit) {
                    explicit.push(data_model_1.quad(fact.subject.toString(), fact.predicate.toString(), fact.object.toString(), graph.toString()));
                }
                else {
                    implicit.push(data_model_1.quad(fact.subject.toString(), fact.predicate.toString(), fact.object.toString(), graph.toString()));
                }
            }
        }
        else if (fact.explicit) {
            explicit.push(data_model_1.quad(fact.subject.toString(), fact.predicate.toString(), fact.object.toString()));
        }
        else {
            implicit.push(data_model_1.quad(fact.subject.toString(), fact.predicate.toString(), fact.object.toString()));
        }
    }
    return { implicit, explicit };
}
exports.factsToQuads = factsToQuads;
