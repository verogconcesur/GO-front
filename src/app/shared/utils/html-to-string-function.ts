export const htmlToStringConverter = (html: string): string => {
  html = html.replace(/<[^>]+>/g, '');
  return html.split('/n').join(' ').split('&nbsp;').join(' ');
};
