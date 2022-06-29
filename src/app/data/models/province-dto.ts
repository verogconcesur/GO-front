import CountryDto from './country-dto';

export default interface ProvinceDto {
  code: string;
  id: number;
  name: string;
  country: CountryDto;
}
