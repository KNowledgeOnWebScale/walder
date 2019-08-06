/**
 * A type of JSON separator.
 */
export declare class SeparatorType {
    static readonly COMMA: SeparatorType;
    static readonly OBJECT_START: SeparatorType;
    static readonly OBJECT_END: SeparatorType;
    static readonly OBJECT_END_COMMA: SeparatorType;
    static readonly ARRAY_START: SeparatorType;
    static readonly ARRAY_END: SeparatorType;
    static readonly ARRAY_END_COMMA: SeparatorType;
    static readonly GRAPH_FIELD_NONCOMPACT: SeparatorType;
    static readonly GRAPH_FIELD_COMPACT: SeparatorType;
    static readonly CONTEXT_FIELD: SeparatorType;
    readonly label: string;
    private constructor();
}
