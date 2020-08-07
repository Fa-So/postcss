import { SourceMapGenerator, RawSourceMap } from 'source-map'

import Node, {
  Position,
  Source,
  ChildNode,
  NodeProps,
  ChildProps,
  AnyNode
} from './node.js'
import Declaration, { DeclarationProps } from './declaration.js'
import Root, { RootProps } from './root.js'
import Comment, { CommentProps } from './comment.js'
import AtRule, { AtRuleProps } from './at-rule.js'
import Result, { Message } from './result.js'
import Rule, { RuleProps } from './rule.js'
import Container, { ContainerProps } from './container.js'
import Warning, { WarningOptions } from './warning.js'
import Input, { FilePosition } from './input.js'
import CssSyntaxError from './css-syntax-error.js'
import list, { List } from './list.js'
import Processor from './processor.js'

export {
  WarningOptions,
  FilePosition,
  Position,
  Source,
  ChildNode,
  AnyNode,
  Message,
  NodeProps,
  DeclarationProps,
  ContainerProps,
  CommentProps,
  RuleProps,
  ChildProps,
  AtRuleProps,
  RootProps,
  Warning,
  CssSyntaxError,
  Node,
  Container,
  list,
  Declaration,
  Comment,
  AtRule,
  Rule,
  Root,
  Result,
  Input
}

export type SourceMap = SourceMapGenerator & {
  toJSON(): RawSourceMap
}

export type Helpers = { result: Result } & Postcss

export interface Plugin {
  postcssPlugin: string
  Root?: (root: Root, helper: Helpers) => Promise<void> | void
  RootExit?: (root: Root, helper: Helpers) => Promise<void> | void
  Declaration?: (decl: Declaration, helper: Helpers) => Promise<void> | void
  DeclarationExit?: (decl: Declaration, helper: Helpers) => Promise<void> | void
  Rule?: (rule: Rule, helper: Helpers) => Promise<void> | void
  RuleExit?: (rule: Rule, helper: Helpers) => Promise<void> | void
  AtRule?: (atRule: AtRule, helper: Helpers) => Promise<void> | void
  AtRuleExit?: (atRule: AtRule, helper: Helpers) => Promise<void> | void
  Comment?: (comment: Comment, helper: Helpers) => Promise<void> | void
  CommentExit?: (comment: Comment, helper: Helpers) => Promise<void> | void
}

export interface PluginCreator<PluginOptions> {
  (opts?: PluginOptions): Plugin
  postcss: true
}

interface Transformer extends TransformCallback {
  postcssPlugin: string
  postcssVersion: string
}

export interface TransformCallback {
  (root: Root, result: Result): Promise<void> | void
}

export interface OldPlugin<T> extends Transformer {
  (opts?: T): Transformer
  postcss: Transformer
}

export type AcceptedPlugin =
  | Plugin
  | PluginCreator<any>
  | OldPlugin<any>
  | TransformCallback
  | {
      postcss: TransformCallback | Processor
    }
  | Processor

export interface Parser {
  (
    css: string | { toString(): string },
    opts?: Pick<ProcessOptions, 'map' | 'from'>
  ): Root
}

export interface Builder {
  (part: string, node?: AnyNode, type?: 'start' | 'end'): void
}

export interface Stringifier {
  (node: AnyNode, builder: Builder): void
}

export interface Syntax {
  /**
   * Function to generate AST by string.
   */
  parse?: Parser

  /**
   * Class to generate string by AST.
   */
  stringify?: Stringifier
}

export interface SourceMapOptions {
  /**
   * Indicates that the source map should be embedded in the output CSS
   * as a Base64-encoded comment. By default, it is `true`.
   * But if all previous maps are external, not inline, PostCSS will not embed
   * the map even if you do not set this option.
   *
   * If you have an inline source map, the result.map property will be empty,
   * as the source map will be contained within the text of `result.css`.
   */
  inline?: boolean

  /**
   * Source map content from a previous processing step (e.g., Sass).
   *
   * PostCSS will try to read the previous source map
   * automatically (based on comments within the source CSS), but you can use
   * this option to identify it manually.
   *
   * If desired, you can omit the previous map with prev: `false`.
   */
  prev?: string | boolean | object | ((file: string) => string)

  /**
   * Indicates that PostCSS should set the origin content (e.g., Sass source)
   * of the source map. By default, it is true. But if all previous maps do not
   * contain sources content, PostCSS will also leave it out even if you
   * do not set this option.
   */
  sourcesContent?: boolean

  /**
   * Indicates that PostCSS should add annotation comments to the CSS.
   * By default, PostCSS will always add a comment with a path
   * to the source map. PostCSS will not add annotations to CSS files
   * that do not contain any comments.
   *
   * By default, PostCSS presumes that you want to save the source map as
   * `opts.to + '.map'` and will use this path in the annotation comment.
   * A different path can be set by providing a string value for annotation.
   *
   * If you have set `inline: true`, annotation cannot be disabled.
   */
  annotation?: string | boolean | ((file: string, root: Root) => string)

  /**
   * Override `from` in map’s sources.
   */
  from?: string

  /**
   * Use absolute path in generated source map.
   */
  absolute?: boolean
}

export interface ProcessOptions {
  /**
   * The path of the CSS source file. You should always set `from`,
   * because it is used in source map generation and syntax error messages.
   */
  from?: string

  /**
   * The path where you'll put the output CSS file. You should always set `to`
   * to generate correct source maps.
   */
  to?: string

  /**
   * Function to generate AST by string.
   */
  parser?: Syntax | Parser

  /**
   * Class to generate string by AST.
   */
  stringifier?: Syntax | Stringifier

  /**
   * Object with parse and stringify.
   */
  syntax?: Syntax

  /**
   * Source map options
   */
  map?: SourceMapOptions | boolean
}

export interface Postcss {
  /**
   * Create a new `Processor` instance that will apply `plugins`
   * as CSS processors.
   *
   * ```js
   * let postcss = require('postcss')
   *
   * postcss(plugins).process(css, { from, to }).then(result => {
   *   console.log(result.css)
   * })
   * ```
   *
   * @param plugins PostCSS plugins.
   * @return Processor to process multiple CSS.
   */
  (plugins?: AcceptedPlugin[]): Processor
  (...plugins: AcceptedPlugin[]): Processor

  /**
   * Default function to convert a node tree into a CSS string.
   */
  stringify: Stringifier

  /**
   * Parses source css and returns a new `Root` node,
   * which contains the source CSS nodes.
   *
   * ```js
   * // Simple CSS concatenation with source map support
   * const root1 = postcss.parse(css1, { from: file1 })
   * const root2 = postcss.parse(css2, { from: file2 })
   * root1.append(root2).toResult().css
   * ```
   */
  parse: Parser

  /**
   * Contains the `list` module.
   *
   * ```js
   * let { list } = require('postcss')
   * list.space('5px calc(10% + 5px)') //=> ['5px', 'calc(10% + 5px)']
   * ```
   */
  list: List

  /**
   * Creates a new `Comment` node.
   *
   * ```js
   * let { comment } = require('postcss')
   * comment({ text: 'test' })
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New comment node
   */
  comment(defaults?: CommentProps): Comment

  /**
   * Creates a new `AtRule` node.
   *
   * ```js
   * let { atRule } = require('postcss')
   * atRule({ name: 'charset' }).toString() //=> "@charset"
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New at-rule node.
   */
  atRule(defaults?: AtRuleProps): AtRule

  /**
   * Creates a new `Declaration` node.
   *
   * ```js
   * let { decl } = require('postcss')
   * decl({ prop: 'color', value: 'red' }).toString() //=> "color: red"
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New declaration node.
   */
  decl(defaults?: DeclarationProps): Declaration

  /**
   * Creates a new `Rule` node.
   *
   * ```js
   * let { rule } = require('postcss')
   * rule({ selector: 'a' }).toString() //=> "a {\n}"
   * ```
   *
   * @param default Properties for the new node.
   * @return New rule node.
   */
  rule(defaults?: RuleProps): Rule

  /**
   * Creates a new `Root` node.
   *
   * ```js
   * let { root } = require('postcss')
   * root({ after: '\n' }).toString() //=> "\n"
   * ```
   *
   * @param defaults Properties for the new node.
   * @return New root node.
   */
  root(defaults?: RootProps): Root
}

export const stringify: Stringifier
export const atRule: Postcss['atRule']
export const parse: Parser
export const decl: Postcss['decl']
export const rule: Postcss['rule']
export const root: Postcss['root']

declare const postcss: Postcss

export default postcss
