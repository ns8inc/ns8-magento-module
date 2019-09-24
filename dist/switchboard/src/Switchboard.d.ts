export default interface Switchboard {
    modules: Module[];
    switches: Switch[];
}
export interface Module {
    name: string;
    version: string;
}
export interface Switch {
    type: string;
    name: string;
    operator: string;
    handler: string;
    sources: Source[];
}
export interface Source {
    moduleName: string;
    fileName: string;
    methodName: string;
}
