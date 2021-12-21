import { OrderedMap } from 'immutable';
import { NoteType } from "./note";

export type NoteFieldMeta = {
    fid: string,
    displayname: string,
    type: string,
}
export type FieldID = string;

export type NoteTypeInfo = {
    type: NoteType,
    name:string,
    version:string,
    fields:{ [k: FieldID]: NoteFieldMeta }
}

export let NoteTypesData = OrderedMap<NoteType, NoteTypeInfo>();

export const MUTUAL_FUND = "MUTUAL_FUND";
export const BANK_ACCOUNT = "BANK_ACCOUNT";

NoteTypesData = NoteTypesData.set(MUTUAL_FUND, {
    type:MUTUAL_FUND,
    name:"Mutual Fund",
    version:"1.0",
    fields:{
        "userid":{
        fid:"userid",
        displayname:"User ID",
        type:"string"
    },"password":{
        fid:"password",
        displayname:"Password",
        type:"string"
    },
    "folioid":{
        fid:"folioid",
        displayname:"Folio ID",
        type:"string"
    }
}
});

NoteTypesData = NoteTypesData.set(BANK_ACCOUNT, {
    type:BANK_ACCOUNT,
    name:"Bank Account",
    version:"1.0",
    fields:{
        "userid":{
        fid:"userid",
        displayname:"User ID",
        type:"string"
    },"password":{
        fid:"password",
        displayname:"Password",
        type:"string"
    },
    "accountnumber":{
        fid:"accountnumber",
        displayname:"Account Number",
        type:"string"
    }
}
});

