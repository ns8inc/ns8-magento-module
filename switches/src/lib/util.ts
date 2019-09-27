import { AddressType } from "ns8-protect-models";

/**
 * Converts a string to an AddressType
 * @param type
 */
const toProtectAddressType = (type: string): AddressType => {
  switch (type.toLowerCase().trim()) {
    case 'billing':
      return AddressType.BILLING;
    case 'shipping':
      return AddressType.SHIPPING;
    case 'device':
      return AddressType.DEVICE;
    default:
      return AddressType.DEVICE;
  }
}

export {
  toProtectAddressType
}
