import { TypedUseSelectorHook } from "react-redux";
import type { RootState } from "./app/store";

declare module "react-redux" {
  // make the default useSelector typed for RootState across the app
  export const useSelector: TypedUseSelectorHook<RootState>;
}
