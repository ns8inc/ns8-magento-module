import {
  CreateOrderActionSwitch as CreateOrderAction,
  OnInstallEventSwitch as OnInstallEvent,
  UpdateCustVerifyStatusEventSwitch as UpdateCustVerifyStatusEvent,
  UpdateEQ8ScoreEventSwitch as UpdateEQ8ScoreEvent,
  UpdateOrderRiskEventSwitch as UpdateOrderRiskEvent,
  UninstallActionSwitch as UninstallAction,
  UpdateMerchantActionSwitch as UpdateMerchantAction,
  UpdateOrderStatusEventSwitch as UpdateOrderStatusEvent
} from '@ns8/ns8-magento2-switches';

/*
 The purpose of this module is 3 fold.

 1. Preserve existing architectural behavior with no impact to other, internal refactorings so that Switchboard behaves in all ways identical to other projects.
 2. Reduce the number of imports (external dependencies) required for Switchboard as close to 1 as possible
 3. Make the deployment artifacts as small as possible for speed (currently, deploying a static version should be close to 3MB zipped)

 The switches project exports the step function handlers with the suffix `Switch`, but the serverless config expects those names without the suffix.
 In the interest of making the lightest touch possible, we are simply importing the handlers required by Serverless and then exporting them with the names that Servless expects to find.
 Eventually, the goal would be to collapse this Switchboard project with the Switches project so that we have a single, canonical source of truth for all the things.
 Until then, this approach is intended to be the lightest touch to improve developer efficiency and maintain compatibility with the existing architecture.
*/

export {
  CreateOrderAction,
  OnInstallEvent,
  UpdateCustVerifyStatusEvent,
  UpdateEQ8ScoreEvent,
  UpdateOrderStatusEvent,
  UpdateOrderRiskEvent,
  UninstallAction,
  UpdateMerchantAction,
}
