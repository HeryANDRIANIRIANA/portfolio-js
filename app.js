const express = require('express');
const multer=require('multer');
const odbc = require('mysql2/promise');
const Db=require(__dirname+'/env/db');
const QmanagerBE=require(__dirname+'/privateModule/QmanagerBE');
const articleBE=require(__dirname+'/privateModule/articleBE');
const mouvementStockBE=require(__dirname+'/privateModule/mouvementStockBE');
const tableStructureBE=require(__dirname+'/privateModule/tableStructureBE');
const dateBE=require(__dirname+'/privateModule/dateBE');
const exceljs = require('exceljs');
const app = express();
const path = require('path')      ;
/*  */
/* const port = process.env.PORT || 3002;
const adr = "0.0.0.0"; */

const cors = require("cors");
const fs = require("fs");
app.use(cors());
app.use(express.json({limit:"1mb"}));
const dependencyes={Db:Db,QmanagerBE:QmanagerBE,articleBE:articleBE,tableStructureBE:tableStructureBE,mouvementStockBE:mouvementStockBE, dateBE:dateBE}

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));

// Assuming your CSS file is in the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	// perform index.ejs  
	res.render('index', { title: 'TEST', message: '' });
});//get started

app.post('/test',async (req,res)=>{
	let myQman=new QmanagerBE(odbc, res, req, {dependencyes:dependencyes})
	let r=await myQman.testConnexion()
	// console.log(res);
	res.json(r)
})

/* '/getListArticle' by NumPiece */
app.post('/getListArticle',async(req,res)=>{
	let db=new Db();
	const myarticleBE=new articleBE( odbc, res, req, {conStr:db.cs, dependencyes:dependencyes}	);
	const r=await myarticleBE.getListArticle();
	// console.log(r);
	res.json(r);                             
})

app.post('/saveArticle',async(req,res)=>{
	let db=new Db();
	const myArticleBE=new articleBE( odbc, res, req, {conStr:db.cs, dependencyes:dependencyes}	);
	console.log(req.body);
	 let r=req.body
	 switch(req.body.oper){
		 case "add":
		 r=await myArticleBE.addArticle(req.body);
		 break;
		 case "del":
		 r=await myArticleBE.delArticle(req.body);
		 break;
		 case "update":
		 r=await myArticleBE.updtArticle(req.body);
		 break;
	 }
	 let currentMouvementStock=req.body.currentMouvementStock;
	 // TODO:64-SAVE MOUVEMENTsTOCK
	 if(currentMouvementStock!==null){//saving mvtStock
		const myMouvementStockBE=new mouvementStockBE( odbc, res, req, {conStr:db.cs, dependencyes:dependencyes}	);
		const r=await myMouvementStockBE.addLine(req.body);
	 }
	// console.log(r);
	// r["concernedLine"]=req.body;
	//
	res.json(r);                             
})


/* '/getListArticle' by NumPiece */
app.post('/getListMouvementStock',async(req,res)=>{
	let db=new Db();
	const myMouvementStockBE=new mouvementStockBE( odbc, res, req, {conStr:db.cs, dependencyes:dependencyes}	);
	const r=await myMouvementStockBE.getList();
	res.json(r);                             
})


app.listen(port, adr, () => {
  console.log(`Server is running at ${adr}:${port}`);
});
