import express from 'express';
import connects  from './server/config/db';
import { router } from './server/routes/routes';

const path = require('path')

// cross origin resource sharing............
const cors = require('cors');

// morgan for logs............
const morgan = require('morgan');

const app = express();

const PORT = 4001; 

// db connection.............
connects();

//parse json bodies...........
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('tiny'));

//cors........................
app.use(cors({
    origin: ['http://localhost:4200'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


//make files as static........
app.use('/files', express.static(path.join(__dirname, "./public/assets/files")));


// route ......................
app.use('/', router);

/////////////////////////////////////////////////////////////////////////////////////////////////////////

// import cron from 'node-cron'
// import { v4 } from 'uuid';
// const excelJS = require("exceljs");
// import UserModel from "./server/models/users";

// const workbook = new excelJS.Workbook();
// const worksheet = workbook.addWorksheet("excelUsers");

// worksheet.columns = [
//     { header: "S no.", key: "_id", width: 10 },
//     { header: "class no.", key: "classNumber", width: 10 },
//     { header: "Name", key: "name", width: 10 },
//     { header: "Email Id", key: "email", width: 10 },
//     { header: "Phone", key: "phone", width: 10 },
//     { header: "Date of Birth", key: "dob", width: 10 },
//     { header: "delete status", key: "isDeleted", width: 10 },
//   ];

//   let counter = 1;

//   const User =  UserModel.find()
//   User.forEach((user: any) => {
//     user.classNumber = counter;
//     worksheet.addRow(user);
//     counter++;
//   });

//   worksheet.getRow(1).eachCell((cell: any) => {
//     cell.font = { bold: true };
//   });

// // node cron job fn.............
// cron.schedule('*/3 */2 * * * *', () => {

//     const data =  workbook.xlsx.writeFile(
//       v4()+".xlsx"
//     );
//   });

  //////////////////////////////////////////////////////////////////////////////////////////////////////


// server connection
app.listen(PORT, (): void => {
    console.log(`Server is running on ${PORT}`);
    
})