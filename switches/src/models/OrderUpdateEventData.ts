import { Address } from 'ns8-protect-models';
import { Customer } from 'ns8-protect-models';
import { FraudAssessment } from 'ns8-protect-models';
import { LineItem } from 'ns8-protect-models';
import { Session } from 'ns8-protect-models';
import { Status } from 'ns8-protect-models';
import { Transaction } from 'ns8-protect-models';

export interface OrderUpdateEventData {
  addresses: Address[];
  createdAt: Date;
  currency: string;
  customer: Customer;
  customerVerification: null;
  fraudAssessments: FraudAssessment[];
  hasGiftCard: boolean;
  id: string;
  lineItems: LineItem[];
  merchantId: string;
  name: string;
  platformCreatedAt: Date;
  platformId: string;
  platformStatus: string;
  risk: string;
  session: Session;
  status: Status;
  totalPrice: number;
  transactions: Transaction[];
  updatedAt: Date;
}
