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

class Safefly {

  /**
   * Safely converts
   */
  private static _safely = (context: Object, splits: string[], create: Boolean = false):any => {
    let result = context;
    for (var i = 0, s: string; result && (s = splits[i]); i++) {
      result = (s in result ? result[s] : (create ? result[s] = {} : undefined));
    }
    return result;
  }

  /**
   * Safely sets a value on an object at the requested location
   */
  public static set = (context: Object, name: string, value: any):any => {
    const splits = name.split('.'), s = splits.pop(), result = Safefly._safely(context, splits, true);
    return result && s ? (result[s] = value) : undefined;
  };

  /**
   * Safely gets a value from an object at the requested location
   */
  public static get = (context: Object, name: string, create: Boolean = false):any => {
    return Safefly._safely(context, name.split('.'), create);
  };

  /**
   * Safely checks for the existence of a value at the requested location
   */
  public static exists = (context: Object, name: string): Boolean => {
    return Safefly.get(context, name, false) !== undefined;
  }
}

export {
  toProtectAddressType,
  Safefly
}
