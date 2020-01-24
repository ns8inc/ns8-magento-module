/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as operatorModule from '@ns8/ns8-switchboard-operator';
import { Order } from 'ns8-protect-models';
import { OrderUpdate } from 'ns8-protect-models';
import { CreateOrderActionStep } from './steps/CreateOrderActionStep';
import { OnInstallEventStep } from './steps/OnInstallEventStep';
import { UninstallActionStep } from './steps/UninstallActionStep';
import { UpdateCustVerifyStatusEventStep } from './steps/UpdateCustVerifyStatusEventStep';
import { UpdateEQ8ScoreEventStep } from './steps/UpdateEQ8ScoreEventStep';
import { UpdateMerchantActionStep } from './steps/UpdateMerchantActionStep';
import { UpdateOrderRiskEventStep } from './steps/UpdateOrderRiskEventStep';
import { UpdateOrderStatusActionStep } from './steps/UpdateOrderStatusActionStep';
import { UpdateOrderStatusEventStep } from './steps/UpdateOrderStatusEventStep';

/*
  The concept of this file is to explicitly export the function that the AWS Lambda will execute,
  in order that all of the definitional concepts are defined within Switches and not dynamically inferred from some external consumer.
  This allows the Switchboard project to consume a single module: the ns8-magento2-switches module and nothing else.
  This should also allow for the eventual collapse of the two projects (Switchboard and Switches) so that we have a single point of definition + execution.

  The naming conventions here may seem obtuse, but the reasoning is that we need to export an explicit `Switch` function, which is the result of passing
  the Step function defined in `/steps` through the Switchboard Operator to get the `handle`; and the `handle` is the method which AWS will invoke.
  On the consumer side (in Switchboard), we simply import these `*Switch` methods and then export them using the step naming convention.
*/

export const CreateOrderAction: (event: any) => Promise<Order> = ((): any =>
  new operatorModule.CreateOrderActionOperator([new CreateOrderActionStep()]).handle)();
export const OnInstallEvent: (event: any) => Promise<any> = ((): any =>
  new operatorModule.EventOperator([new OnInstallEventStep()]).handle)();
export const UninstallAction: (event: any) => Promise<any> = ((): any =>
  new operatorModule.UninstallActionOperator([new UninstallActionStep()]).handle)();
export const UpdateCustVerifyStatusEvent: (event: any) => Promise<any> = ((): any =>
  new operatorModule.EventOperator([new UpdateCustVerifyStatusEventStep()]).handle)();
export const UpdateEQ8ScoreEvent: (event: any) => Promise<any> = ((): any =>
  new operatorModule.EventOperator([new UpdateEQ8ScoreEventStep()]).handle)();
export const UpdateMerchantAction: (event: any) => Promise<any> = ((): any =>
  new operatorModule.UpdateMerchantActionOperator([new UpdateMerchantActionStep()]).handle)();
export const UpdateOrderRiskEvent: (event: any) => Promise<any> = ((): any =>
  new operatorModule.EventOperator([new UpdateOrderRiskEventStep()]).handle)();
export const UpdateOrderStatusAction: (event: any) => Promise<OrderUpdate> = ((): any =>
  new operatorModule.UpdateOrderStatusActionOperator([new UpdateOrderStatusActionStep()]).handle)();
export const UpdateOrderStatusEvent: (event: any) => Promise<OrderUpdate> = ((): any =>
  new operatorModule.EventOperator([new UpdateOrderStatusEventStep()]).handle)();
