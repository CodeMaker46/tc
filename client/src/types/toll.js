// Toll Data Structure
// {
//   _id: string,
//   plaza_code: string,
//   name: string,
//   lat: number,
//   lng: number,
//   tolls: {
//     car: number,
//     lcv: number,
//     bus: number,
//     threeAxle: number,
//     fourAxle: number,
//     hcmEme: number,
//     oversized: number
//   }
// }

export const VIEW_MODES = {
  DETAILS: 'details',
  CARDS: 'cards'
};

export const SORT_FIELDS = {
  TOLLNAME: 'name',
  PLAZA_CODE: 'plaza_code',
  CAR_RATE: 'tolls.car',
  LCV_RATE: 'tolls.lcv',
  BUS_RATE: 'tolls.bus',
  THREE_AXLE_RATE: 'tolls.threeAxle',
  FOUR_AXLE_RATE: 'tolls.fourAxle',
  HCM_EME_RATE: 'tolls.hcmEme',
  OVERSIZED_RATE: 'tolls.oversized'
};

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
}; 