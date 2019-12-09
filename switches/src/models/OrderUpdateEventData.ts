import {
  Address,
  Customer,
  FraudAssessment,
  LineItem,
  Session,
  Status,
  Transaction
} from 'ns8-protect-models';

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
