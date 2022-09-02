const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} = require("firebase/firestore");
const fs = require("fs");
const { resolve } = require("path");

const firebaseConfig = {
  apiKey: "AIzaSyATBmb87L0x1OF1fVGS_psMb3sgVD54_s0",
  authDomain: "clinic-management-website.firebaseapp.com",
  projectId: "clinic-management-website",
  storageBucket: "clinic-management-website.appspot.com",
  messagingSenderId: "424460823077",
  appId: "1:424460823077:web:f4fe8d7a131bf8e483edcc",
  measurementId: "G-J4PX75EKWG",
};

initializeApp(firebaseConfig);

class PopulateJsonFirestore {
  constructor() {
    console.time("Time taken");
    this.db = getFirestore();

    const [, , filepath, type, collectionName] =
      process.argv;

    this.absolutePath = resolve(process.cwd(), filepath);

    this.type = type;

    this.collectionName = collectionName;

    if (this.type !== "set" && this.type !== "add") {
      console.error(`Wrong method type ${this.type}`);
      console.log("Accepted methods are: set or add");
      this.exit(1);
    }

    // If file path is missing
    if (
      this.absolutePath == null ||
      this.absolutePath.length < 1
    ) {
      console.error(
        `Make sure you have file path assigned ${this.absolutePath}`
      );
      this.exit(1);
    }

    // If collection name not set
    if (
      this.collectionName == null ||
      this.collectionName.length < 1
    ) {
      console.error(
        `Make sure to specify firestore collection ${this.collectionName}`
      );
      this.exit(1);
    }

    console.log(`ABS: FILE PATH ${this.absolutePath}`);
    console.log(`Type: method is ${this.type}`);
  }

  // The populate function
  // uploads the json data to firestore
  async populate() {
    // initialize our data array
    let data = [];

    // Get data from json file using fs
    try {
      data = JSON.parse(
        fs.readFileSync(this.absolutePath, {
          encoding: "utf-8",
        }),
        "utf8"
      );
    } catch (e) {
      console.error(e.message);
    }

    //data.forEach((item) => console.log(item));
    // loop through the data
    // Populate Firestore on each run
    // Make sure file has atleast one item.
    if (data.length < 1) {
      console.error("Make sure file contains items.");
    }
    var i = 0;
    for (var item of data) {
      console.log(item);
      try {
        this.type === "set"
          ? await this.set(item)
          : await this.add(item);
      } catch (e) {
        console.log("ERROR WHILE SETTING", e.message);
        console.dir(e);
        this.exit(1);
      }
      // Successfully got to end of data;
      // print success message
      if (data.length - 1 === i) {
        console.log(
          `**************************\n****SUCCESS UPLOAD*****\n**************************`
        );
        console.timeEnd("Time taken");
        this.exit(0);
      }

      i++;
    }
  }

  // Sets data to firestore database
  // Firestore auto generated IDS
  async add(item) {
    console.log(`Adding item with id ${item.id}`);
    const colRef = collection(this.db, this.collectionName);
    return addDoc(colRef, Object.assign({}, item))
      .then(_ => true)
      .catch(e => console.err(e.message));
    // return this.db
    //   .collection(this.collectionName)
    //   .add(Object.assign({}, item))
    //   .then(() => true)
    //   .catch(e => console.error(e.message));
  }

  // Set data with specified ID
  // Custom Generated IDS
  async set(item) {
    console.log(`setting item with id ${item.id}`);
    const docRef = doc(
      this.db,
      this.collectionName,
      `${item.id}`
    );
    return setDoc(docRef, Object.assign({}, item))
      .then(_ => true)
      .catch(e => console.err(e.message));
    // return this.db
    //   .doc(`${this.collectionName}/${item.id}`)
    //   .set(Object.assign({}, item))
    //   .then(() => true)
    //   .catch(e => console.error(e.message));
  }

  // Exit nodejs console
  exit(code) {
    return process.exit(code);
  }
}
// console.log(__dirname);
const populateFireStore = new PopulateJsonFirestore();
populateFireStore.populate();
