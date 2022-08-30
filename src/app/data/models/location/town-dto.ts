import ProvinceDTO from './province-dto';

export default interface TownDTO {
  code: string;
  id: number;
  name: string;
  province: ProvinceDTO;
}
