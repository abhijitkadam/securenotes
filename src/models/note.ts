import { OrderedMap } from 'immutable';
import { v4 as uuidv4 } from 'uuid';
import { Result, Err, Ok } from 'ts-results';
import { NoteTypeInfo } from './notetypes';

export type NoteType = string
export type FieldName = string
export type FieldType = string | number

export type Field = {
    data: string,
    isNumber: boolean,
    isFromTemplate: boolean,
    name: string,
    displayname: string
}

export type NoteData = {
    type: NoteType,
    title: string,
    profileid: string,
    author: string,
    timestamp?: Date,
    // fields: { [k: FieldName]: Field }
    fields: Field[]

}

//Object.fromEntries(map);

export type Note = {
    id: string,
    data: NoteData
}





export class NoteFields {
    fields: OrderedMap<string, Field>;
    type: string;

    constructor(noteinfo?: NoteTypeInfo) {
        if (noteinfo) {
            this.fields = OrderedMap();
            this.type = noteinfo.type;
            Object.keys(noteinfo.fields).forEach(k => {
                let finfo = noteinfo.fields[k];
                let field: Field = {
                    data: "",
                    isNumber: false,
                    isFromTemplate: true,
                    name: finfo.fid,
                    displayname: finfo.displayname
                };
                this.fields = this.fields.set(field.name, field);
            });
        } else {
            this.fields = OrderedMap();
            this.type = "CUSTOM";
        }
    }

    static fromNoteData(note: NoteData): NoteFields {
        var notefields = new NoteFields();
        notefields.type = note.type;
        // Object.keys(note.fields).forEach(f => {
        //     notefields.addField(note.fields[f])
        // })

        note.fields.forEach(f => {
            notefields.addField(f);
        })

        return notefields;
    }


    public addField(f: Field): Result<void, Error> {

        if (f.name === "") {
            f.name = uuidv4();
        }

        if (this.fields.get(f.name)) {
            return Err(new Error("field name already present"));
        }

        this.fields = this.fields.set(f.name, f);

        return Ok.EMPTY;

    }

    public removeField(fieldname: string): Result<void, Error> {

        if (this.fields.get(fieldname)) {
            this.fields = this.fields.remove(fieldname);
            return Ok.EMPTY;
        }

        return Err(new Error("field not present"));
    }
}