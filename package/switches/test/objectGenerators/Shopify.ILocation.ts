import { ILocation } from 'shopify-api-node';

const locationObject: ILocation = {
  id: 1,
  active: true,
  admin_graphql_api_id: null,
  address1: null,
  address2: null,
  city: null,
  country: null,
  country_code: null,
  country_name: null,
  created_at: new Date().toString(),
  deleted_at: null,
  legacy: false,
  name: null,
  phone: null,
  province: null,
  province_code: null,
  updated_at: new Date().toString(),
  zip: null,
};

const locationFromPartial = (locationPartial: Partial<ILocation>): ILocation => (
  { ...locationObject, ...locationPartial }
);

const newPhysicalLocation = (active: boolean): ILocation => {
  const randomId =  Math.floor(Math.random() * 1000000);

  const locationPartial: Partial<ILocation> = {
    active,
    id: randomId,
    name: `${randomId}`,
    address1: `${randomId} Charleston Ave.`,
    city: 'Las Vegas',
    zip: '89102',
    province: 'Nevada',
    country: 'US',
    country_code: 'US',
    country_name: 'United States',
    province_code: 'NV',
    legacy: false,
  };

  return{ ...locationObject, ...locationPartial };
};

const newLegacyLocation = (): ILocation => {
  const randomId =  Math.floor(Math.random() * 1000000);

  const locationPartial: Partial<ILocation> = {
    id: randomId,
    name: `${randomId}`,
    legacy: true,
  };

  return{ ...locationObject, ...locationPartial };
};

export {
  locationFromPartial,
  newLegacyLocation,
  newPhysicalLocation,
};
