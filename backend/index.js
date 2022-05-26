
const express = require('express');
const app = express(),
      port = 9999;

//csv parser for reading the csv file
const csv = require('csv-parser');
const fs = require('fs');


app.use(express.json());

let jsonObj = "";
let idList = [];

app.post('/addMedic', function(request, response){
    response.setHeader("Content-Type", "text/csv");
    console.log(request.body)
    let facilityArr = [];
    let dict = {};

    fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (row) => {
        const fullName = row.FamilyName +" "+ row.GivenName;
        const hospitals = row.NameId;
        if(row.Active === "true"){
            if(dict[fullName]){
                dict[fullName].push(hospitals)
            }else{
                dict[fullName] = [hospitals]
            }
        }
    })
    .on('end', () => {
        try {
            console.log(facilityArr);
            console.log(dict);
          
           } catch (error) {
            console.error(error);
           }
        console.log('CSV file successfully processed');
    });


    if(request.method == 'POST'){
        jsonObj= request.body;
        const resourceType = request.body.resourceType;
        const id = request.body.id;

        //Verification for value of id if it already exists.
        if(!idList.includes(id)){
            idList.push(id);
        }else{
            throw new Error('Id already exists');
        }

        
        const name = [request.body.name];
        const facility = [request.body.facility];
        const active = request.body.active;

        //Verification for non-existent id
        if(!id){
            throw new Error('Error ! Id is not present');
        }else if(resourceType !== "Practitioner"){
            throw new Error('Error ! Resource is not Practitioner');
        }

        //Verification for active status = true
      if(active == true){
          console.log(name);
          console.log(facility);
      }   
      response.send({
        name,
        facility,
        active
      }); 
    }

});





app.get('/', (req,res) => {
    
    res.send('App Works !!!!');
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});