import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, length: number = 4): string {
  if (address.length <= length * 2 + 2) {
    return address; // No need to shorten if the address is already short
  }

  const start = address.substring(0, length + 2); // Include '0x'
  const end = address.substring(address.length - length);

  return `${start}...${end}`;
}
export function shortenUrl(url: string, maxLength: number): string {
  if (url.length <= maxLength) return url;

  const urlParts = url.split(/(\/)/);
  const protocolAndDomain = urlParts.slice(0, 3).join("");
  const remainingPath = urlParts.slice(3).join("");

  if (protocolAndDomain.length >= maxLength) {
    return protocolAndDomain.slice(0, maxLength - 3) + "...";
  }

  const remainingLength = maxLength - protocolAndDomain.length;
  return (
    protocolAndDomain + remainingPath.slice(0, remainingLength - 3) + "..."
  );
}
