export function money(cents:number|null|undefined,currency="EUR",locale="en"){return new Intl.NumberFormat(locale,{style:"currency",currency:currency.toUpperCase()}).format((cents||0)/100)}
export function shortDate(value:string|null|undefined,locale="en"){if(!value)return ", ";return new Intl.DateTimeFormat(locale,{dateStyle:"medium"}).format(new Date(value))}
