import { Transaction } from '@ns8/magento2-rest-client';
export declare class Convert {
    static toTransaction(json: string): Transaction[];
    static transactionToJson(value: Transaction[]): string;
}
