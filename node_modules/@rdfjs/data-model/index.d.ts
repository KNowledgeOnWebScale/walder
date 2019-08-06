import * as RDF from "rdf-js";

export const defaultGraphInstance: RDF.DefaultGraph;
export function namedNode(value: string): RDF.NamedNode;
export function blankNode(value?: string): RDF.BlankNode;
export function literal(value: string, languageOrDatatype?: string | RDF.NamedNode): RDF.Literal;
export function variable(value: string): RDF.Variable;
export function defaultGraph(): RDF.DefaultGraph;
export function triple<Q extends RDF.BaseQuad = RDF.Quad>(
  subject: Q['subject'], predicate: Q['predicate'], object: Q['object']): Q;
export function quad<Q extends RDF.BaseQuad = RDF.Quad>(
  subject: Q['subject'], predicate: Q['predicate'], object: Q['object'], graph?: Q['graph']): Q;
