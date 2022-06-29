import ProvinceDto from './province-dto';

export default interface TownDto {
  code: string;
  id: number;
  name: string;
  province: ProvinceDto;
}
