import type { CountryResponse } from "../types/responseType.type"
import type {CardFields} from "../types/cardField.type";

export function getCountryCardField(rawData: CountryResponse):CardFields {
    console.log(rawData)
}