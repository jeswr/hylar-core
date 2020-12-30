/**
 * Created by aifb on 02.05.16.
 */
import type Fact from './Logics/Fact';
export declare function IllegalFact(fact: Fact): Error;
export declare function OrphanImplicitFact(): Error;
export declare function StorageNotInitialized(): Error;
export declare function FileIO(filename: string): Error;
export declare function DBParsing(filename: string): Error;
export declare function CountNotImplemented(expr: string): Error;
