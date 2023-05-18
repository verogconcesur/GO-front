import { AttachmentDTO } from '../cards/card-attachments-dto';
import FacilityDTO from '../organization/facility-dto';
import LandingBannerDTO from './landing-banner-dto';
import LandingLinkDTO from './landing-link-dto';
import LandingThemeDTO from './landing-theme-dto';

export default interface LandingConfigDTO {
  backgroundImage: AttachmentDTO;
  banners: LandingBannerDTO[];
  facilities: FacilityDTO[];
  id: number;
  landingTheme: LandingThemeDTO;
  logo: AttachmentDTO;
  logoAlt: AttachmentDTO;
  menuLinks: LandingLinkDTO[];
  socialLinks: LandingLinkDTO[];
  themes: LandingThemeDTO[];
}
