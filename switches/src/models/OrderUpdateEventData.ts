import { Address } from 'ns8-protect-models';
import { Customer } from 'ns8-protect-models';
import { FraudAssessment } from 'ns8-protect-models';
import { LineItem } from 'ns8-protect-models';
import { Session } from 'ns8-protect-models';
import { Transaction } from 'ns8-protect-models';

export interface OrderUpdateEventData {
  status: string;
  createdAt: Date;
  updatedAt: Date;
  id: string;
  merchantId: string;
  platformId: string;
  name: string;
  platformCreatedAt: Date;
  currency: string;
  totalPrice: number;
  risk: string;
  hasGiftCard: boolean;
  platformStatus: string;
  addresses: Address[];
  customer: Customer;
  fraudAssessments: FraudAssessment[];
  session: Session;
  customerVerification: null;
  transactions: Transaction[];
  lineItems: LineItem[];
}
