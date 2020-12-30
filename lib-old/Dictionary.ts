/**
 * Created by Spadon on 13/11/2015.
 */

import * as Logics from './Logics/Logics.js'
import * as Utils from './Utils.js'

/**
 * Dictionary used to index triples (in turtle) and their fact representation.
 * @type {{substractFactSets: Function, combine: Function}|exports|module.exports}
 */

import ParsingInterface from './ParsingInterface'

class Dictionary {
    dict: { '#default': {}; };
    lastUpdate: number;
    purgeThreshold: number;
    allowPurge: boolean;
    constructor () {
      this.dict = {
        '#default': {}
      }
      this.lastUpdate = 0
      this.purgeThreshold = 13000000
    }

    turnOnForgetting () {
      this.allowPurge = true
    }

    turnOffForgetting () {
      this.allowPurge = false
    }

    resolveGraph (graph = '#default') {
      if (!this.dict[graph]) {
        this.dict[graph] = {}
      }
      return graph
    }

    clear () {
      this.dict = {
        '#default': {}
      }
    }

    /**
     * Returns the fact corresponding to the turtle triple.
     * @param ttl
     * @returns {*}
     */
    get (ttl, graph) {
      let facts
      graph = this.resolveGraph(graph)
      facts = this.dict[graph][ttl]
      if (facts !== undefined) {
        return facts
      } else return false
    }

    /**
     * Updates the fact representation of
     * an existing turtle triple, or puts
     * a new one by transform the fact into turtle
     * through the ParsingInterface.
     * @param fact
     * @returns {*}
     */
    put (fact, graph) {
      const timestamp = new Date().getTime()
      let factToTurtle

      if (this.allowPurge) {
        this.purgeOld()
      }

      this.lastUpdate = timestamp
      graph = this.resolveGraph(graph)

      try {
        if (fact.predicate === 'FALSE') {
          this.dict[graph].__FALSE__ = [fact]
        } else {
          factToTurtle = ParsingInterface.factToTurtle(fact)
          if (this.dict[graph][factToTurtle]) {
            this.dict[graph][factToTurtle] = Utils.insertUnique(this.dict[graph][factToTurtle], fact)
          } else {
            this.dict[graph][factToTurtle] = [fact]
            this.dict[graph][factToTurtle].lastUpdate = timestamp
          }
        }
        return true
      } catch (e) {
        return e
      }
    }

    isOld (graph, factIndex) {
      return (this.dict[graph][factIndex].lastUpdate - this.lastUpdate) > this.purgeThreshold
    }

    purgeOld () {
      for (const i in this.dict.length) {
        for (const j in this.dict[i].length) {
          for (const k in this.dict[i][j]) {
            if (!this.dict[i][j][k].isValid() && this.isOld(i, j)) {
              delete this.dict[i][j][k]
            }
          }
        }
      }
    }

    /**
     * Return the full content of the dictionary.
     * @returns {Object}
     */
    content () {
      return this.dict
    }

    /**
     * Sets dictionary's content.
     * @param content Object
     */
    setContent (content) {
      this.dict = content
    }

    /**
     * Gets all facts from the dictionary.
     * @returns {Array}
     */
    values (graph) {
      const values = []
      graph = this.resolveGraph(graph)
      for (const key in this.dict[graph]) {
        for (let i = 0; i < this.dict[graph][key].length; i++) {
          values.push(this.dict[graph][key][i])
        }
      }
      return values
    }

    /**
     * Get all explicit full dictionary graph as turtle.
     * @returns {Array}
     */
    explicitGraphs (graph) {
      const explicitGraphs = []
      for (const graph in this.dict) {
        explicitGraphs.push({
          name: graph,
          content: ParsingInterface.factsToTurtle(Logics.getOnlyExplicitFacts(this.values(graph)))
        })
      }
      return explicitGraphs
    }

    /**
     * Gets facts corresponding to the turtle triples,returns an object
     * {found: facts found, notfound: turtle triples with no repr.}
     * @param triples An array of turtle triples.
     * @returns {{found: Array, notfound: Array}}
     */
    findValues (triples = [], graph) {
      const values = []
      const notfound = []
      let facts
      graph = this.resolveGraph(graph)
      for (let i = 0; i < triples.length; i++) {
        facts = this.dict[graph][triples[i].toString().slice(0, -2)]
        if (facts !== undefined) {
          for (let j = 0; j < facts.length; j++) {
            values.push(facts[j])
          }
        } else {
          notfound.push(triples[i])
        }
      }
      return {
        found: values,
        notfound
      }
    }

    /**
     * Gets turtle triples corresponding to the facts,returns an object
     * {found: triples found, notfound: facts repr. nothing.}
     * @param values
     * @returns {{found: Array, notfound: Array}}
     */
    findKeys (values, graph) {
      const keys = []
      let value
      const notfound = []
      graph = this.resolveGraph(graph)
      for (let i = 0; i < values.length; i++) {
        value = values[i]
        for (const key in this.dict[graph]) {
          try {
            if (this.dict[graph][key].toString().includes(value.toString())) {
              keys.push(key)
              break
            } else {
              notfound.push(value)
            }
          } catch (e) {
            throw e
          }
        }
      }
      return {
        found: keys,
        notfound
      }
    }

    getFactFromStringRepresentation (factStr, graph) {
      graph = this.resolveGraph(graph)
      for (const key in this.dict[graph]) {
        for (let i = 0; i < this.dict[graph][key].length; i++) {
          if (this.dict[graph][key][i].toString() == factStr) {
            return {
              key,
              value: this.dict[graph][key][i],
              graph
            }
          }
        }
      }
      return false
    }
}

export default Dictionary
