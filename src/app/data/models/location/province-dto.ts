import CountryDTO from './country-dto';

export default interface ProvinceDTO {
  code: string;
  id: number;
  name: string;
  country: CountryDTO;
}
