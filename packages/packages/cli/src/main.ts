import { awesomeFn } from "@relink-cardano/core";

export async function main() {
  // dependencies across child packages
  const out = await awesomeFn();
  return out;
}
