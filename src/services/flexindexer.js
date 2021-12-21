const {Document } = require("flexsearch");
const { OrderedMap } = require('immutable');

export default class FlexIndexer {
    constructor() {
       this.index = new Document({
            tokenize: "full",
            minlength:1,
            //store:true,
            id: "id",
            bool:"or",
            index: ["title", "content"]
        });
        
        this.searchDocs = OrderedMap();
    }

    indexNote(note, update = false) {
        let noteindexid = note.profileid+ "_" + note.id;        
            
            let noteToIndex = {id:noteindexid, title: note.title, content:note.content};
            if (update){
                this.index.update(noteToIndex)    
            } else {
                this.index.add(noteToIndex)
            }            
            this.searchDocs = this.searchDocs.set(noteindexid, {indexid: noteindexid,profileid:note.profileid, noteid:note.id, title:note.title});
    } 
    
    removeNote(profileid, id) {
        let noteindexid = profileid+ "_" + id;
        this.index.remove(noteindexid);
        this.searchDocs = this.searchDocs.delete(noteindexid);
    }

    search(term) {
        //let searchedResults =  this.index.search(term, {enrich:true});
        let searchedResults =  this.index.search(term);
        let resultsMap = OrderedMap();
        searchedResults.forEach(resSet => {
            resSet.result.forEach(n => {
                let res = this.searchDocs.get(n);
                if(res){
                    resultsMap = resultsMap.set(n,res);
                }
                
            });
            return resultsMap;
        });
        return resultsMap.valueSeq().toArray();
    }
};