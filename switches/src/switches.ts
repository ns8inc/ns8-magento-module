import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { Order } from 'ns8-protect-models';
import { OrderUpdate } from 'ns8-protect-models';
import {
  CreateOrderAction,
  OnInstallEvent,
  UninstallAction,
  UpdateCustVerifyStatusEvent,
  UpdateEQ8ScoreEvent,
  UpdateMerchantAction,
  UpdateOrderRiskEvent,
  UpdateOrderStatusAction,
  UpdateOrderStatusEvent
} from '.';

/*
  The concept of this file is to explicitly export the function that the AWS Lambda will execute,
  in order that all of the definitional concepts are defined within Switches and not dynamically inferred from some external consumer.
  This allows the Switchboard project to consume a single module: the ns8-magento2-switches module and nothing else.
  This should also allow for the eventual collapse of the two projects (Switchboard and Switches) so that we have a single point of definition + execution.

  The naming conventions here may seem obtuse, but the reasoning is that we need to export an explicit `Switch` function, which is the result of passing
  the Step function defined in `/steps` through the Switchboard Operator to get the `handle`; and the `handle` is the method which AWS will invoke.
  On the consumer side (in Switchboard), we simply import these `*Switch` methods and then export them using the step naming convention.
*/

export const CreateOrderActionSwitch: (event: any) => Promise<Order> = (() =>
  new operatorModule.CreateOrderActionOperator([new CreateOrderAction()])
    .handle)();
export const OnInstallEventSwitch: (event: any) => Promise<any> = (() =>
  new operatorModule.EventOperator([new OnInstallEvent()]).handle)();
export const UninstallActionSwitch: (event: any) => Promise<any> = (() =>
  new operatorModule.UninstallActionOperator([new UninstallAction()]).handle)();
export const UpdateCustVerifyStatusEventSwitch: (
  event: any
) => Promise<any> = (() =>
  new operatorModule.EventOperator([new UpdateCustVerifyStatusEvent()])
    .handle)();
export const UpdateEQ8ScoreEventSwitch: (event: any) => Promise<any> = (() =>
  new operatorModule.EventOperator([new UpdateEQ8ScoreEvent()]).handle)();
export const UpdateMerchantActionSwitch: (event: any) => Promise<any> = (() =>
  new operatorModule.UpdateMerchantActionOperator([new UpdateMerchantAction()])
    .handle)();
export const UpdateOrderRiskEventSwitch: (event: any) => Promise<any> = (() =>
  new operatorModule.EventOperator([new UpdateOrderRiskEvent()]).handle)();
export const UpdateOrderStatusActionSwitch: (
  event: any
) => Promise<OrderUpdate> = (() =>
  new operatorModule.UpdateOrderStatusActionOperator([
    new UpdateOrderStatusAction()
  ]).handle)();
export const UpdateOrderStatusEventSwitch: (
  event: any
) => Promise<OrderUpdate> = (() =>
  new operatorModule.EventOperator([new UpdateOrderStatusEvent()]).handle)();
