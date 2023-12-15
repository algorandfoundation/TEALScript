/* eslint-disable */

// This file is copied directly from the Polytype library. It's included here so it can be included during 
// The internal TypeScript diagnostics TEALScript does on contracts.

// Type definitions for Polytype 0.17.0

declare namespace Polytype {
  // Helpers /////////////////////////////////////////////////////////////////////////////////////

  type Enrich<MainType, ExtraType> = MainType & Omit<ExtraType, keyof MainType>;

  type EnrichMore<MainType, ExtraTypes extends unknown[]> = EnrichMoreProps<MainType, ExtraTypes>[ExtraTypes extends []
    ? 0
    : 1];

  interface EnrichMoreProps<MainType, ExtraTypes extends unknown[]> {
    0: MainType;
    1: ExtraTypes extends [infer ExtraHead, ...infer ExtraTail]
      ? EnrichMore<Enrich<MainType, ExtraHead>, ExtraTail>
      : never;
  }

  type IntersectionOf<T extends unknown[]> = UnboxedIntersectionOf<{ [key in keyof T]: [T[key]] }> extends {
    0: infer U;
  }
    ? U
    : never;

  type NonEmptyArray<T> = [T, ...T[]];

  type ProtoType<T> = T extends { prototype: infer U } ? U : never;

  type ReadonlySuperConstructorParameters<T extends SuperConstructor> = Readonly<
    ConstructorParameters<(new (...args: unknown[]) => unknown) & T>
  >;

  type UnboxedIntersectionOf<T extends unknown[]> = UnionOf<T> extends infer U
    ? (U extends unknown ? (arg: U) => unknown : never) extends (arg: infer V) => unknown
      ? V
      : never
    : never;

  type UnionOf<T extends unknown[]> = T[number];

  // Implementation related //////////////////////////////////////////////////////////////////////

  type AsSuperConstructor<T> = Extract<T, SuperConstructor>;

  type ClusteredConstructor<T extends SuperConstructor[]> = {
    readonly prototype: ProtoType<IntersectionOf<T>>;

    new (...args: MapTupleTypesToOptionalReadonlyConstructorParameters<T>): ClusteredPrototype<T>;

    new (...args: UnionOf<MapTupleTypesToReadonlySuperConstructorInvokeInfo<T>>[]): ClusteredPrototype<T>;
  } & EnrichMore<SuperConstructorSelector<UnionOf<T>>, T>;

  type ClusteredPrototype<T extends SuperConstructor[]> = SuperPrototypeSelector<UnionOf<T>> &
    IntersectionOf<{ [key in keyof T]: InstanceType<T[key]> }>;

  type MapTupleTypesToOptionalReadonlyConstructorParameters<T extends SuperConstructor[]> = {
    [key in keyof T]?: ReadonlySuperConstructorParameters<AsSuperConstructor<T[key]>>;
  };

  type MapTupleTypesToReadonlySuperConstructorInvokeInfo<T extends SuperConstructor[]> = {
    [key in keyof T]: Readonly<SuperConstructorInvokeInfo<AsSuperConstructor<T[key]>>>;
  };

  type SuperConstructor = abstract new (...args: any) => object;

  class SuperConstructorSelector<T extends SuperConstructor> {
    /**
     * Allows accessing a static property or calling a static method in a specified base class,
     * eliminating ambiguity when multiple base classes share a property with the same key.
     *
     * @param type
     *
     * The referenced base class.
     */
    protected class<U extends T>(type: U): U;
  }

  class SuperPrototypeSelector<T extends SuperConstructor> {
    /**
     * Allows accessing an instance property or calling an instance method in a specified base
     * class, eliminating ambiguity when multiple base classes share a property with the same
     * key.
     *
     * @param type
     *
     * The referenced base class.
     */
    protected class<U extends T>(type: U): InstanceType<U>;
  }
}

/** Specifies the arguments used to call a base class constructor. */
export interface SuperConstructorInvokeInfo<T extends Polytype.SuperConstructor> {
  /** The base class being referenced. */
  super: T;

  /**
   * An array specifying the arguments with which the base class constructor should be called.
   * If undefined, the base class constructor will be called without any arguments.
   */
  arguments?: Polytype.ReadonlySuperConstructorParameters<T> | undefined;
}

/** Allows defining a derived class that inherits from multiple base classes. */
export function classes<T extends Polytype.NonEmptyArray<Polytype.SuperConstructor>>(
  ...types: T
): Polytype.ClusteredConstructor<T>;

/**
 * Globally defines `classes` and `Object.getPrototypeListOf`.
 *
 * Calling this function allows using Polytype everywhere inside the current JavaScript realm
 * without imports.
 *
 * This function is only available in the module versions of Polytype.
 * For most purposes it is better to import the global version of Polytype directly rather than
 * calling this function.
 *
 * @returns
 *
 * `true` on success; `false` otherwise.
 */
export function defineGlobally(): boolean;

/**
 * Returns a list of prototypes of an object.
 * * For objects with a regular non‐null prototype, an array containing the prototype as its only
 * element is returned.
 * * For objects with a null prototype, an empty array is returned.
 * * For constructors and instance prototypes based on Polytype clustered objects, an array
 * containing all zero or more prototypes of the object is returned.
 *
 * @param o
 *
 * The object that references the prototypes.
 */
export function getPrototypeListOf(o: any): any[];
