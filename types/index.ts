import React from "react";
import { IconType } from "react-icons";

/** UI interface */

export enum BatchType {
  ERC20="ERC20",
  ERC721="ERC721"
}
export interface CsvERC20Data {
  token_address:string;
  recipient:string;
  amount:number

}

export interface CsvERC721Data {
  token_address:string;
  from?:string; // use the account?.address
  recipient:string;
  token_id:number;

}


export interface LinkItemProps {
  name: string;
  title?: string;
  icon: IconType;
  href: string;
  target?: string;
  isExternal?: boolean;
  isSubmenu?: boolean;
  linksSubmenu?: LinkItemProps[];
}
