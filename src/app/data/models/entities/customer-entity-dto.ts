import FacilityDTO from '../organization/facility-dto';

export default interface CustomerEntityDTO {
  fullName?: string;
  email: string;
  phone: string;
  socialSecurityId: string;
  facility: FacilityDTO;
  businessTypeCode: string;
  addressPostalCode: string;
  communicationPreferredPhone: string;
  communicationLandline: string;
  communicationWorkMobile: string;
  communicationWorkLandline: string;
  businessTypeDescription: string;
  gender: string;
  isCompany: boolean;
  reference: string;
  name: string;
  firstName: string;
  secondName: string;
  id: number;
  customerId: string;
}
export interface BusinessTypes {
  code: string;
  description: string;
}
