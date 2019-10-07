import {
  CreateOrderAction,
  OnInstallEvent,
  UpdateCustVerifyStatusEvent,
  UpdateEQ8ScoreEvent,
  UpdateOrderRiskEvent,
  UninstallAction,
  UpdateMerchantAction,
  UpdateOrderStatusEvent
} from '.';
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { Order } from 'ns8-protect-models';
import { OrderUpdate } from 'ns8-protect-models';

export const CreateOrderActionSwitch: (event: any) => Promise<Order> = (() => new operatorModule.CreateOrderActionOperator([new CreateOrderAction()]).handle)();
export const OnInstallEventSwitch: (event: any) => Promise<any> = (() => new operatorModule.EventOperator([new OnInstallEvent()]).handle)();
export const UpdateCustVerifyStatusEventSwitch: (event: any) => Promise<any> = (() => new operatorModule.EventOperator([new UpdateCustVerifyStatusEvent()]).handle)();
export const UpdateEQ8ScoreEventSwitch: (event: any) => Promise<any> = (() => new operatorModule.EventOperator([new UpdateEQ8ScoreEvent()]).handle)();
export const UpdateOrderRiskEventSwitch: (event: any) => Promise<any> = (() => new operatorModule.EventOperator([new UpdateOrderRiskEvent()]).handle)();
export const UninstallActionSwitch: (event: any) => Promise<any> = (() => new operatorModule.UninstallActionOperator([new UninstallAction()]).handle)();
export const UpdateMerchantActionSwitch: (event: any) => Promise<any> = (() => new operatorModule.UpdateMerchantActionOperator([new UpdateMerchantAction()]).handle)();
export const UpdateOrderStatusEventSwitch: (event: any) => Promise<OrderUpdate> = (() => new operatorModule.UpdateOrderStatusActionOperator([new UpdateOrderStatusEvent()]).handle)();
