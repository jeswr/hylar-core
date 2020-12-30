"use strict";
/* eslint-disable no-undef */
/**
 * Created by aifb on 15.03.16.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const n3_1 = require("n3");
const data_model_1 = require("@rdfjs/data-model");
const Rules_1 = require("../lib/Rules");
const Solver = __importStar(require("../lib/Logics/Solver"));
const Fact_1 = __importDefault(require("../lib/Logics/Fact"));
const ReasoningEngine = __importStar(require("../lib/ReasoningEngine"));
const ParsingInterface_1 = require("../lib/ParsingInterface");
describe('Rule tests', () => {
    it('should order the rule causes (most to least restrictive)', () => {
        const transitiveRule = Rules_1.owl2rl[4];
        transitiveRule.orderCausesByMostRestrictive();
        expect(transitiveRule.causes[0].constants.length).toEqual(2);
    });
});
describe('Solver tests', () => {
    it('should return inference wrt. transitivity rule', () => __awaiter(void 0, void 0, void 0, function* () {
        const facts = [
            new Fact_1.default('#parentOf', '#papy', '#papa', [], true),
            new Fact_1.default('#parentOf', '#papa', '#fiston', [], true),
            new Fact_1.default('#parentOf', '#grandpapy', '#papy', [], true),
            new Fact_1.default('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '#parentOf', 'http://www.w3.org/2002/07/owl#TransitiveProperty', [], true),
        ];
        const { additions } = yield ReasoningEngine.incremental(facts, [], [], Rules_1.owl2rl);
        expect(additions.length).toEqual(7);
    }));
    it('should return inference wrt. transitivity rule', () => {
        const facts = [
            new Fact_1.default('http://www.w3.org/2000/01/rdf-schema#subClassOf', '#mammal', '#animal', [], true),
            new Fact_1.default('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', '#lion', '#mammal', [], true),
        ];
        Solver.evaluateRuleSet(Rules_1.owl2rl, facts).then((x) => {
            // TODO: Make sure no issues are propogated due to test change
            expect(x.cons.length).toEqual(1);
        });
    });
});
describe('Store integration tests', () => {
    const storeExplicit = new n3_1.Store();
    const storeImplicit = new n3_1.Store();
    storeExplicit.addQuads([
        data_model_1.quad(data_model_1.namedNode('http://example.org/mammal'), data_model_1.namedNode('http://www.w3.org/2000/01/rdf-schema#subClassOf'), data_model_1.namedNode('http://example.org/animal')),
        data_model_1.quad(data_model_1.namedNode('http://example.org/lion'), data_model_1.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), data_model_1.namedNode('http://example.org/animal')),
        data_model_1.quad(data_model_1.namedNode('http://example.org/lion'), data_model_1.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), data_model_1.namedNode('http://example.org/mammal')),
    ]);
    // TODO: Merge quads into appropriate graphs format
    it('should work', () => __awaiter(void 0, void 0, void 0, function* () {
        const r = yield ReasoningEngine.incremental(ParsingInterface_1.triplesToFacts([data_model_1.quad(data_model_1.namedNode('http://example.org/dog'), data_model_1.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), data_model_1.namedNode('http://example.org/mammal'))]), [], ParsingInterface_1.triplesToFacts(storeExplicit.getQuads(null, null, null, null)), Rules_1.owl2rl);
        const { implicit, explicit } = ParsingInterface_1.factsToQuads(r.additions);
        storeImplicit.addQuads(implicit);
        expect(implicit.length).toEqual(2);
        expect(explicit.length).toEqual(1);
    }));
});
