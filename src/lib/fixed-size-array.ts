// we use numeric literal types for length as TS 2.7 does for fixed size tuples.
export type FixedSizeArray<N extends number, T, M extends string = '0'> = {
    readonly [k in M]: any;
} & { length: N } & ReadonlyArray<T>;

/*
let d: FixedSizeArray<2, string>;

d = ['a', 'b']; // ok
d = ['a']; // error
d = ['a', 'b', 'c']; // error
d = ['a', true]; // error
                    
d.push('d'); // error                   

let e: FixedSizeArray<0, string>;
// we get an error, but it is not what we want
// however, in this case void could be a better type
// why do we want to define an immutable array of zero elements?                    
e = [];   
*/                 
