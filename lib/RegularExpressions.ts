/**
 * Created by aifb on 25.07.16.
 */

export const TRIPLE = /(\([^\s]+?\s[^\s]+?\s[^\s]+?\))|false/gi;
export const ATOM = /\(([^\s]+)\s([^\s]+)\s([^\s]+)\)/i;
export const LITERAL_WITHOUT_TYPE = /^("[^"]*").*$/i;
export const LITERAL_RAW_VALUE = /^("[^"]*").*$/i;
export const PREFIXED_URI = /([a-z0-9]+):[^/]{2}.*/i;
