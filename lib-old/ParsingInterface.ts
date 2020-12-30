/*
 * Created by MT on 20/11/2015.
 */

import Fact from './Logics/Fact'

import Errors from './Errors'
import RegularExpressions from './RegularExpressions'
import Utils from './Utils'
import q from 'q'
import sparqlJs from 'sparqljs'
const SparqlParser = new sparqlJs.Parser()
const SparqlGenerator = new sparqlJs.Generator()

/**
 * The parsing interface, for transforming facts, triples, turtle or even results bindings
 * into other representations.
 */

/**
 * The SPARQL parser oddly transforms prefixed typed literal without angle brackets (!).
 * This should fix it.
 */
/**
 * @deprecated Caused some literals that contain stuff like "blabla\" xsd:string"@en to be replaced with "blabla \" <xsd:string"@en>
 * @returns {string}
 */
String.prototype.format = function () {
  if (this.match(RegularExpressions.LITERAL_UNFORMATTED)) {
    return this.replace(RegularExpressions.LITERAL_UNFORMATTED, '$1<$2>')
  } else {
    return this.toString()
  }
}

ParsingInterface = {
  /**
     * Transforms a triple into a fact.
     * @param t The triple
     * @param explicit True if the resulting fact is explicit, false otherwise (default: true)
     * @returns Object resulting fact
     */
  tripleToFact: function (t, explicit, notUsingValid) {
    if (explicit === undefined) {
      explicit = true
    }
    return new Fact(t.predicate.toString(), t.subject.toString(), t.object.toString()/* .format() */, [], explicit, [], [], notUsingValid, t.toString())
  },

  triplesToFacts: function (t, explicit, notUsingValid) {
    const arr = []
    let triple
    const that = this

    if (explicit === undefined) {
      explicit = true
    }

    for (let i = 0; i < t.length; i++) {
      triple = t[i]
      arr.push(that.tripleToFact(triple, explicit, notUsingValid))
    }
    return arr
  },

  /**
     * Transforms a raw entity (URI or literal) into turtle.
     * @param entityStr
     * @returns {*}
     */
  parseStrEntityToTurtle: function (entityStr) {
    const literalPattern = RegularExpressions.LITERAL_UNFORMATTED
    const blankNodePattern = RegularExpressions.BLANK_NODE
    const variablePattern = RegularExpressions.VARIABLE
    const typeOfDatatypePattern = RegularExpressions.DATATYPE_TYPE
    const dblQuoteInStrPattern = RegularExpressions.DBLQUOTED_STRING
    let dblQuoteMatch

    /* try {
            entityStr = entityStr.format();
        } catch(e){} */

    entityStr = entityStr.replace(/(\n|\r)/g, '')

    if (entityStr === undefined) return false

    if (entityStr.startsWith('_')) {
      return entityStr
    }

    if (entityStr.match(dblQuoteInStrPattern)) {
      dblQuoteMatch = entityStr.match(dblQuoteInStrPattern)
      entityStr = dblQuoteMatch[1] + dblQuoteMatch[2].replace(/(")/g, "'") + dblQuoteMatch[3] // temporary ; has to be debbuged asap
    }

    if (entityStr.match(literalPattern)) {
      return entityStr.replace(literalPattern, '$1<$2>')
    } else if (entityStr.match(blankNodePattern) || entityStr.match(variablePattern) || entityStr.match(typeOfDatatypePattern) || entityStr.match(dblQuoteInStrPattern)) {
      return entityStr
    } else {
      return `<${entityStr}>`
    }
  },

  /**
     * Transforms a fact into turtle.
     * @param fact
     * @returns {string}
     */
  factToTurtle: function (fact) {
    let subject, predicate, object

    /* if (fact.fromTriple !== undefined) {
            return fact.fromTriple;
        } */

    if (fact.falseFact) {
      return ''
    }

    subject = this.parseStrEntityToTurtle(fact.subject)
    predicate = this.parseStrEntityToTurtle(fact.predicate)
    object = this.parseStrEntityToTurtle(fact.object)

    if (subject && predicate && object) {
      return `${subject} ${predicate} ${object} . `
    } else {
      return ''
    }
  },

  /**
     * Transforms a set of facts into turtle.
     * @param facts
     * @returns {string}
     */
  factsToTurtle: function (facts) {
    let ttl = ''
    let fact
    const that = this
    for (let i = 0; i < facts.length; i++) {
      fact = facts[i]
      ttl += that.factToTurtle(fact)
    }
    return ttl
  },

  /**
     * Transforms a parsed update where query to a construct query
     * @param parsedQuery as update where
     * @returns parsedQuery as construct
     */
  updateWhereToConstructWhere: function (parsedQuery) {
    parsedQuery.type = 'query'
    parsedQuery.queryType = 'CONSTRUCT'

    parsedQuery.template = []
    parsedQuery.where = []

    parsedQuery.updates.forEach(up => {
      if (up.where != null) {
        parsedQuery.where = parsedQuery.where.concat(up.where)
      }
      if (up.insert != null) {
        up.insert.forEach(({ triples }) => {
          parsedQuery.template = parsedQuery.template.concat(triples)
        })
      }
      if (up.delete != null) {
        up.delete.forEach(({ triples }) => {
          parsedQuery.template = parsedQuery.template.concat(triples)
        })
      }
    })

    delete parsedQuery.updates

    if (parsedQuery.where.length == 0) {
      parsedQuery.where = {
        type: 'bgp',
        triples: parsedQuery.template
      }
    }

    return parsedQuery
  },

  /**
     * Parses a SPARQL query.
     * @param query
     * @returns {*}
     */
  parseSPARQL: function (query) {
    // Hack to remove potential CONSTRUCT issues with GRAPH in the first pattern
    query = query.replace(RegularExpressions.CONSTRUCT_GRAPH_1ST_PATTERN, '$1$2$3')
    return SparqlParser.parse(query)
  },

  tripleToTurtle: function ({ subject, predicate, object }) {
    const ttl = `${this.parseStrEntityToTurtle(subject.toString())} ${this.parseStrEntityToTurtle(predicate.toString())} ${this.parseStrEntityToTurtle(object.toString())} . `
    return ttl
  },

  triplesToTurtle: function (triples) {
    let ttl = ''
    for (let i = 0; i < triples.length; i++) {
      ttl += this.tripleToTurtle(triples[i]).replace(/(\n|\r)/g, '').replace(/\\&/g, '&')
    }
    return ttl
  },

  isolateWhereQuery: function ({ where, queryType, variables, template }, whereIndex) {
    let isolatedQuery
    const patterns = where[whereIndex].patterns
    if (queryType == 'SELECT') {
      isolatedQuery = `${queryType} ${variables.join(' ')} { `
    } else if (queryType == 'CONSTRUCT') {
      isolatedQuery = `${queryType} { `
      for (var i = 0; i < template.length; i++) {
        isolatedQuery += this.tripleToTurtle(template[i])
      }
      isolatedQuery += ' } WHERE { '
    }

    if (where[whereIndex].name !== undefined) {
      isolatedQuery += ` GRAPH <${where[whereIndex].name}> `
    }
    isolatedQuery += ' { '
    if (patterns != null) {
      for (var i = 0; i < patterns.length; i++) {
        isolatedQuery += ` ${this.triplesToTurtle(patterns[i].triples)} `
      }
    } else {
      isolatedQuery += ` ${this.triplesToTurtle(where[whereIndex].triples)} `
    }
    isolatedQuery += ' } '

    return `${isolatedQuery} } `
  },

  constructEquivalentQuery: function (query, graph) {
    let rewrittenQuery, regex

    if (query.match(RegularExpressions.CONSTRUCT_BODYQUERY_WITH_BRACKETS)) {
      query = query.replace(RegularExpressions.CONSTRUCT_BODYQUERY_WITH_BRACKETS, '$1')
    }

    if (query.match(RegularExpressions.NO_BRACKET_BODYQUERY)) {
      regex = RegularExpressions.NO_BRACKET_BODYQUERY
    } else {
      regex = RegularExpressions.SINGLE_BRACKET_BODYQUERY
    }

    if (graph) {
      rewrittenQuery = query.replace(regex, `CONSTRUCT { $1 } WHERE { GRAPH <${graph}> { $1 } }`)
    } else {
      rewrittenQuery = query.replace(regex, 'CONSTRUCT { $1 } WHERE { $1 }')
    }

    return rewrittenQuery
  },

  isUpdateWhere: function ({ updates }) {
    try {
      if ((updates[0].where) ||
                (updates[0].updateType == 'deletewhere') ||
                (updates[0].updateType == 'insertwhere')) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  },

  isInsert: function ({ updates }) {
    let res
    try {
      res = updates[0].insert.length > 0
    } catch (e) {
      return false
    }
    return res
  },

  buildUpdateQueryWithConstructResults: function (initialQuery, results) {
    if (results.hasOwnProperty('triples')) {
      switch (this.isInsert(initialQuery)) {
        case true:
          return `INSERT DATA { ${this.triplesToTurtle(results.triples)} }`
          break
        default:
          return `DELETE DATA { ${this.triplesToTurtle(results.triples)} }`
      }
    } else {
      return ''
    }
  },

  turtleToTriples (turtle) {
    return this.parseSPARQL(`insert data { ${turtle} }`).updates[0].insert[0].triples
  },

  turtleToFacts (turtle) {
    return this.triplesToFacts(this.turtleToTriples(turtle))
  },

  deserializeQuery (sparqlQuery) {
    const query = SparqlGenerator.stringify(sparqlQuery)
    return query
  }
}

export default ParsingInterface
