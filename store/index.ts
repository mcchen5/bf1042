import { JsonFileStore } from "./json/JsonFileStore.ts";
import type { Store } from "./Store.ts";

interface CreateStoreOptions {
  dataFilePath?: string;
}

export function createStore(options: CreateStoreOptions = {}): Store {
  return new JsonFileStore({
    dataFilePath: options.dataFilePath ?? "./data/store.json",
  });
}

export type { Store } from "./Store.ts";
