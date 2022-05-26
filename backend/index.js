const express = require("express");
const app = express(),
  port = 9999;

//csv parser for reading the csv file
const csv = require("csv-parser");
const fs = require("fs");

app.use(express.json());

let jsonObj = "";
let idList = [];
let valuesArr = [];

// const toBase64 = obj => {
//   // converts the obj to a string
//   const str = JSON.stringify (obj);
//   // returns string converted to base64
//   return Buffer.from(str).toString ('base64');
// };

// const replaceSpecialChars = b64string => {
//   // create a regex to match any of the characters =,+ or / and replace them with their // substitutes
//     return b64string.replace (/[=+/]/g, charToBeReplaced => {
//       switch (charToBeReplaced) {
//         case '=':
//           return '';
//         case '+':
//           return '-';
//         case '/':
//           return '_';
//       }
//     });
//   };

//   const header = {
    
      
//   };
//   const b64Header = toBase64 (header);
//   const jwtB64Header = replaceSpecialChars(b64Header);
//   console.log ("the header is: ",jwtB64Header); 

app.post("/addMedic", function (request, response) {
  response.setHeader("Content-Type", "text/csv");
  let dict = {};
  let idName = {};

  if (request.method == "POST") {
    jsonObj = request.body;
    const resourceType = jsonObj.resourceType;
    const id = jsonObj.id;
    const name = jsonObj.name;
    const facility = jsonObj.facility;
    const active = jsonObj.active;

    //Verification for value of id if it already exists.
    if (!idList.includes(id)) {
      idList.push(id);
    } else {
      throw new Error("Id already exists");
    }

    //Verification for non-existent id
    if (!id) {
      throw new Error("Error ! Id is not present");
    } else if (resourceType !== "Practitioner") {
      throw new Error("Error ! Resource is not Practitioner");
    }

    //Verification for active status = true
    if (active) {
      console.log("The name and facility with active status true");
      console.log("This is the name:", name);
      console.log("This is the facility: ", facility);
    }

    fs.createReadStream("data.csv")
      .pipe(csv())
      .on("data", (row) => {
        const fullName = row.FamilyName + " " + row.GivenName;
        const hospitals = row.NameId;
        const id = row.ID;
        if (row.Active === "true") {
          if (dict[fullName]) {
            dict[fullName].push(hospitals);
          } else {
            dict[fullName] = [hospitals];
          }
        }
        idName[fullName] = id;
        valuesArr = Object.values(idName);

      })
      .on("end", () => {

        //Verification for same id with different name
        try {
          for (let i = 0; i < valuesArr.length; i++) {
            for (let j = i; j < valuesArr.length; j++) {
              if (valuesArr[i] === valuesArr[j + 1]) {
                throw new Error("Error ! Different names with the same id");
              }
            }
          }
          console.log(dict);
        } catch (error) {
          console.error(error);
        }
        console.log("CSV file successfully processed");
      });

    response.send({
      name,
      facility,
      active,
    });
  }
});

app.get("/", (req, res) => {
  res.send("App Works !!!!");
});

app.listen(port, () => {
  console.log(`Server listening on the port::${port}`);
});
