
import {pbkdf2Sync} from 'pbkdf2';
import md5 from 'md5';
import {utils, Counter, ModeOfOperation} from 'aes-js';
// import { util } from "../util";
// import { db } from "../firebase";
// import { setDoc, doc,  getDoc} from "firebase/firestore";
import {FirebaseUtil} from "../firebase/firebase";
import {getFirestore, doc, getDoc,  setDoc } from "firebase/firestore";


export const keyFromPassword = (password, salt) => {
    return pbkdf2Sync(password, salt, 1, 256 / 8, 'sha512');
}

export const getHash = (key, salt) => {
    const data = key + salt;
    return md5(data + salt)
}

export const isProfileHashInDBDifferent = async (hash) => {

    const uid = FirebaseUtil.getCurrentUser(); 
    const db = getFirestore();
    const userRef = doc(db, `/users/${uid}`);    

    const docSnap = await getDoc(userRef);

    const profileDoc = docSnap.data();

    if (profileDoc.keyhash) {
        return !(profileDoc.keyhash === hash);

    } else {
        await setDoc(userRef, {keyhash:hash}, { merge: true });
        return false;
    }

}

export const encrypt = (key, data) => {
    var textBytes = utils.utf8.toBytes(data);
    var aesCtr = new ModeOfOperation.ctr(key, new Counter(5));
    var encryptedBytes = aesCtr.encrypt(textBytes);
   
    return utils.hex.fromBytes(encryptedBytes);
}

export const decrypt = (key, encryptedHexData) => {
    var encryptedBytes = utils.hex.toBytes(encryptedHexData);
    var aesCtr = new ModeOfOperation.ctr(key, new Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);

    return utils.utf8.fromBytes(decryptedBytes);
}


