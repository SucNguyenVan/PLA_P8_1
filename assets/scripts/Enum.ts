import { Enum } from "cc";

export enum PlateType {
  Idle = 0,
  OnlyFood = 1,
  YellowSauce = 2,
  RedSauce = 3,
}

export const PlateTypeEnum = Enum(PlateType);
