const express = require('express');
const multer=require('multer');
// require('dotenv').config();
// const odbc = require('odbc');
const odbc = require('mysql2/promise');
const exceljs = require('exceljs');
const fs = require('fs');
const https = require('https');
const http = require('http');
const ws = require('ws');

const app = express();
const path = require('path');
const port = 3002;
const cors = require("cors");
app.use(cors());
app.use(express.json());
let myDt=new Date();
const defaultIdAnnee=myDt.getFullYear();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dossier où stocker les fichiers
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// privatesModules
const personnel=require('./privateModule/personnel');
const paramSalaire=require('./privateModule/paramSalaire');
const Db=require('./privateModule/Db');
const Db2=require('./privateModule/Db2');
const etatSalaireBE=require('./privateModule/etatSalaireBE');
const mois2BE=require('./privateModule/mois2BE');
const avanceBE=require('./privateModule/avanceBE');
const pointageBE=require('./privateModule/pointageBE');
const heureSupBE=require('./privateModule/heureSupBE');
const ClientBE=require('./privateModule/ClientBE');
const tableStructureBE=require('./privateModule/tableStructureBE');
const BonCommandeBE=require('./privateModule/BonCommandeBE');
const DetailCommandeBE=require('./privateModule/DetailCommandeBE');
const FactureBE=require('./privateModule/FactureBE');
const QmanagerBE=require('./privateModule/QmanagerBE');
const journalBE=require('./privateModule/journalBE');
const DemandeSpecialBE=require('./privateModule/DemandeSpecialBE');
const articleBE=require('./privateModule/articleBE');
const mouvementStockBE=require('./privateModule/mouvementStockBE');
const dateBE=require('./privateModule/dateBE');
const demandeurBE=require('./privateModule/demandeurBE');
const TravauxBE=require('./privateModule/TravauxBE');
const ChequeMatiereBE=require('./privateModule/ChequeMatiereBE');

const dependencyes={ FactureBE:FactureBE, DetailCommandeBE:DetailCommandeBE,BonCommandeBE:BonCommandeBE,tableStructureBE:tableStructureBE,Db2:Db2,exceljs:exceljs,personnel:personnel,paramSalaire:paramSalaire,Db:Db,etatSalaireBE:etatSalaireBE,mois2BE:mois2BE,avanceBE:avanceBE,pointageBE:pointageBE,heureSupBE:heureSupBE, QmanagerBE:QmanagerBE, journalBE:journalBE, DemandeSpecialBE:DemandeSpecialBE, mouvementStockBE:mouvementStockBE, articleBE:articleBE, dateBE:dateBE, demandeurBE:demandeurBE, TravauxBE:TravauxBE, ChequeMatiereBE:ChequeMatiereBE}

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public'));

// Assuming your CSS file is in the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.get('/favicon.ico', (req, res) => res.status(204));
app.get('/', (req, res) => {
	// perform index.ejs  
	res.render('index', { title: 'LAUVE GRH', message: '' });
});//get started

app.get('/personnelInfo',async (req,res)=>{
	let db=new Db();
	let myPerso=new personnel(odbc,res,{conStr:db.cs});
	let allPersonnel=await myPerso.getListAllPers();
	res.json(allPersonnel);
})

app.get('/paramSalaireInfo',async (req,res)=>{
	// old method
	// let db=new Db();
	// let myparamSalaire= new paramSalaire(odbc,res,req,{conStr:db.cs});
	// const ps=await myparamSalaire.getParamSalaire();
	// res.json(ps);
	try {
		let db = new Db();
		let myparamSalaire = new paramSalaire(odbc, res, req, { conStr: db.cs, dependencyes:dependencyes });
		// Appel de la méthode asynchrone avec await
		const ps = await myparamSalaire.getParamSalaire();		
		// Envoi de la réponse
		res.json(ps);
	} catch (err) {
		console.error('Erreur:', err);
		res.status(500).json({ error: 'Erreur interne du serveur' });
	}
	
})

app.post('/importParamSalaire', upload.single('file'),async (req,res)=>{
	let db=new Db();
	let myparamSalaire= new paramSalaire(odbc,res,req,{conStr:db.cs, dependencyes:dependencyes});
	let r=await myparamSalaire.importParamSalaire(exceljs);
	res.json(r);
} );

app.post('/updtEtatSalairePointageI', upload.single('file'),async (req,res)=>{
	let db=new Db();
	let mois=req.body.mois;
	let rows=req.body.rows;
	let myEs= new etatSalaireBE(odbc,res,req,{conStr:db.cs, dependencyes:dependencyes, mois:mois});
	let r=await myEs.updt(rows);
	res.json(r);
} );

app.post('/getAllEtatSalaire',async(req,res)=>{
	// console.log(req.body);
	let db=new Db();
	const mois=req.body.mois;
	let myEs=new etatSalaireBE(odbc,res,req,{conStr:db.cs, mois:mois});
	let allEs=await myEs.getAllEtatSalaire();
	res.json(allEs);
	
});

app.post('/buildNewEtatSalaire',async(req,res)=>{
	// console.log(req.body);
	let db=new Db();
	const mois=req.body.mois;
	let myEs=new etatSalaireBE(odbc,res,req,{conStr:db.cs, mois:mois, dependencyes:dependencyes});
	let allEs=await myEs.buildNewEtatSalaire(paramSalaire);
	res.json(allEs);
	
});

app.post('/updtEtatSalairePersoInfo',async(req,res)=>{
	// console.log(req.body);
	let db=new Db();
	const mois=req.body.mois;
	const data=req.body.data;
	// console.log(data)
	// const EsStructur=req.body.EsStructur;
	// const personnelList=req.body.personnelList;
	let myEs=new etatSalaireBE(odbc,res,req,{conStr:db.cs, mois:mois, dependencyes:dependencyes});
	let allEs=await myEs.updtEtatSalaire12(data);
	res.json(allEs);
	
});

app.post('/exportEs',async(req,res)=>{
	let db=new Db();
	const mois=req.body.mois;
	let myEs=new etatSalaireBE(odbc,res,req,{conStr:db.cs, mois:mois, dependencyes:dependencyes});
	let exportAns=await myEs.export();
	res.json(exportAns);
})

app.post('/getAvanceData', async(req,res)=>{
	let db=new Db();
	const mois=req.body.mois;
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myAvance=new avanceBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const avanceData=await myAvance.getData();
	// console.log(avanceData);
	res.json(avanceData)
	
})

app.post('/getHeureSupData', async(req,res)=>{
	let db=new Db();
	const mois=req.body.mois;
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myHeureSup=new heureSupBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const heureSupData=await myHeureSup.getData();
	// console.log(avanceData);
	res.json(heureSupData)
	
})

app.post('/addHeureSupRow', async(req,res)=>{
	let db=new Db();
	const mois=req.body.mois;
	const rows=req.body.rows;
	// console.log(rows)
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myHeureSup=new heureSupBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const rs=await myHeureSup.addRows(rows);
	// const heureSupData=await myHeureSup.getData();
	// console.log(avanceData);
	res.json(rs)
	
})

app.post('/importAvance', upload.single('file'),async (req,res)=>{
	let db=new Db();
	// let myparamSalaire= new paramSalaire(odbc,res,req,{conStr:db.cs, dependencyes:dependencyes});
	// let r=await myparamSalaire.importParamSalaire(exceljs);
	const mois=req.body.mois;
	// console.log(mois);
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myAvance=new avanceBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const r=await myAvance.importA();
	res.json(r);
} );

app.post('/getMoisInfos', async (req,res)=>{
	let db=new Db();
	
	const mois=req.body.mois;
	
	const mymois=new mois2BE( odbc, res, req, {conStr:db.cs, mois:mois, dependencyes:dependencyes}	);
	const r=await mymois.getInfoFromDb();
	res.json(r);
} );

app.post('/importAvance1', async (req,res)=>{
	let db=new Db();
	// let myparamSalaire= new paramSalaire(odbc,res,req,{conStr:db.cs, dependencyes:dependencyes});
	// let r=await myparamSalaire.importParamSalaire(exceljs);
	const mois=req.body.mois;
	let rows=req.body.rows;
	// console.log(rows);
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myAvance=new avanceBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const r=await myAvance.addRows(rows);
	res.json(r);
} );

app.post('/updtAvance', async (req,res)=>{
	let db=new Db();

	const mois=req.body.mois;
	let rows=req.body.rows;

	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myAvance=new avanceBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const r=await myAvance.updtAvance(rows);
	res.json(r);
} );

app.post('/deleteAvance',async(req,res)=>{
	let db=new Db();
	const mois=req.body.mois;
	const d=req.body.rows;
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myAvance=new avanceBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const r=await myAvance.deteleRows(d);
	res.json(r);
})

app.post('/getPointageData',async(req,res)=>{
	let db=new Db();
	const mois=req.body.mois;
	
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myPtge=new pointageBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const r=await myPtge.getData();
	res.json(r);
})
app.post('/addPointage',async(req,res)=>{
	let db=new Db();
	const mois=req.body.mois;
	const rows=req.body.rows;
	// console.log(rows)
	const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myPtge=new pointageBE( odbc, res, req, {conStr:db.cs, mois:mois, CIN:CIN, dependencyes:dependencyes}	);
	const r=await myPtge.beforeInsert(rows);
	res.json(r);
})

/* getListClient0: to get list of lient en 2025 may be after get thos who do not have 0 at restA payer */
app.post('/getListClient0',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	
	// const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myClient=new ClientBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myClient.getData();
	res.json(r);
})

/* getBonCommandeData: to get Non paid BC of a specified client */
app.post('/getBonCommandeData',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	const IdClient=(typeof(req.body.IdClient)!="undefined")?req.body.IdClient:defaultIdAnnee ;
	
	// const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myBonCommande=new BonCommandeBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myBonCommande.getData({IdClient:IdClient});
	res.json(r);
})

/* updtBonCommande: Updt table bc
@param:ar:[{Avance:Avance, RestAPayer:RestAPayer, NumBC:NumBC}], key:{}
 */
app.post('/updtBonCommande',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=defaultIdAnnee ;
	const ar=(typeof(req.body.ar)!="undefined")?req.body.ar:[] ;
	
	// console.log(ar);
	
	const myBonCommande=new BonCommandeBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myBonCommande.updtBonCommande({ar:ar});
	res.json(r);
})

app.post('/getDetailCommande',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	const NumBC=(typeof(req.body.NumBC)!="undefined")?req.body.NumBC:defaultIdAnnee ;
	
	// const CIN=(typeof(req.body.CIN)!="undefined" )?req.body.CIN:"" ;
	const myDetailCommandeBE=new DetailCommandeBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myDetailCommandeBE.getData({NumBC:NumBC});
	res.json(r);
})

app.post('/getDetailCommandeData',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	const NumBC=(typeof(req.body.NumBC)!="undefined")?req.body.NumBC:"" ;
	
	const myDetailCommandeBE=new DetailCommandeBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myDetailCommandeBE.getDetailCommandeData({NumBC:NumBC});
	res.json(r);
})

app.post('/getListFacture',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	const IdClient=(typeof(req.body.IdClient)!="undefined")?req.body.IdClient:defaultIdAnnee ;
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myFactureBE.getListFacture({IdClient:IdClient});
	res.json(r);
})

/* getDetailFacture to get det */
app.post('/getDetailFacture',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	const NumFact=(typeof(req.body.NumFact)!="undefined")?req.body.NumFact:"" ;
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myFactureBE.getDetailFacture({NumFact:NumFact});
	res.json(r);
})

app.post('/getCountFacture',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	// const IdClient=(typeof(req.body.IdClient)!="undefined")?req.body.IdClient:defaultIdAnnee ;
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myFactureBE.getCountFacture();
	res.json(r);
})

app.post('/addRowFacture',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	let rowFacture=(typeof(req.body.rowFacture)!="undefined")?req.body.rowFacture:{} ;
	let struct=(typeof(req.body.struct)!="undefined")?req.body.struct:{} ;
	// let arDetailFacture=(typeof(req.body.arDetailFacture)!="undefined")?req.body.idAnnee:[] ;
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myFactureBE.addRowFacture({struct:struct, rowFacture:rowFacture});
	// ,arDetailFacture:arDetailFacture
	res.json(r);                             
})

app.post('/addDetailFacture',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	let arDetailFacture=(typeof(req.body.arDetailFacture)!="undefined")?req.body.arDetailFacture:{} ;
	let struct=(typeof(req.body.struct)!="undefined")?req.body.struct:{} ;
	// let arDetailFacture=(typeof(req.body.arDetailFacture)!="undefined")?req.body.idAnnee:[] ;
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myFactureBE.addDetailFacture({struct:struct, arDetailFacture:arDetailFacture});
	
	// ,arDetailFacture:arDetailFacture
	res.json(r);                             
})

/* getDetailFacture2 by arIdProduct */
app.post('/getDetailFacture2',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	let arIdProduct=(typeof(req.body.arIdProduct)!="undefined")?req.body.arIdProduct:{} ;
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	// console.log(arIdProduct);
	const r=await myFactureBE.getDetailFacture2({arIdProduct:arIdProduct});
	res.json(r);                             
})

/* getFactureinfo by NumFact */
app.post('/getFactureinfo',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	let NumFact=(typeof(req.body.NumFact)!="undefined")?req.body.NumFact:{} ;
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	// 
	const r=await myFactureBE.getFactureinfo(NumFact);
	res.json(r);                             
})

/* getDetailFacture by NumFact */
app.post('/getDetailFacture3',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	let NumFact=(typeof(req.body.NumFact)!="undefined")?req.body.NumFact:{} ;
	// console.log(req.body);
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myFactureBE.getDetailFacture3(NumFact);
	res.json(r);                             
})

/* getFacturesImpayees by NumFact */
app.post('/getFacturesImpayees',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;

	// console.log(req.body);
	const myFactureBE=new FactureBE( odbc, res, req, {conStr:db2.cs, idAnnee:idAnnee, dependencyes:dependencyes}	);
	const r=await myFactureBE.getFacturesImpayees();
	res.json(r);                             
})

/* '/getJournalDuJour' by NumFact */
app.post('/getJournalDuJour',async(req,res)=>{
	let db2=new Db2();
	const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	// console.log(req.body);
	const myjournalBE=new journalBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myjournalBE.getJournalDuJour({d:day});
	res.json(r);                             
})

/* '/addJournalRow' by NumFact */
app.post('/addJournalRow',async(req,res)=>{
	let db2=new Db2();
	const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	const ar=(typeof(req.body.ar)!="undefined")?req.body.ar:[] ;
	const structure=(typeof(req.body.structure)!="undefined")?req.body.structure:{} ;
	// console.log(req.body.structure);
	const myjournalBE=new journalBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myjournalBE.addJournalRow({ar:ar, structure:structure});
	res.json(r);                             
})/* 

'/addRowDetailJounal' by NumFact */
app.post('/addRowDetailJounal',async(req,res)=>{
	let db2=new Db2();
	const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	const ar=(typeof(req.body.ar)!="undefined")?req.body.ar:[] ;
	
	const structure=(typeof(req.body.structure)!="undefined")?req.body.structure:{} ;
	// console.log(req.body.structure);
	const myjournalBE=new journalBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myjournalBE.addRowDetailJounal({ar:ar, structure:structure});
	res.json(r);                             
})

/* '/getDetailJournal' by NumPiece */
app.post('/getDetailJournal',async(req,res)=>{
	let db2=new Db2();
	const arNumPiece=(typeof(req.body.arNumPiece)!="undefined")?req.body.arNumPiece:[] ;
	
	const myjournalBE=new journalBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myjournalBE.getDetailJournal({arNumPiece:arNumPiece});
	res.json(r);                             
})

// TODO:445
/* '/getAllDetailJournal' by NumPiece */
app.post('/getAllDetailJournal',async(req,res)=>{
	let db2=new Db2();
	const idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	const myjournalBE=new journalBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myjournalBE.getAllDetailJournal({idAnnee:idAnnee});
	res.json(r);                             
})

/* '/getListArticle' by NumPiece */
app.post('/getListArticle',async(req,res)=>{
	let db2=new Db2();
	const myarticleBE=new articleBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myarticleBE.getListArticle();
	res.json(r);                             
})

/* '/getProfileData' by NumPiece */
app.post('/getProfileData',async(req,res)=>{
	let db2=new Db2();
	const myarticleBE=new articleBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myarticleBE.getProfileData();
	res.json(r);                             
})


/* '/getListDemandeur' by NumPiece */
app.post('/getListDemandeur',async(req,res)=>{
	let db2=new Db2();
	const mydemandeurBE=new demandeurBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await mydemandeurBE.getListDemandeur();
	res.json(r);                             
})

/* '/saveDemandeSpecial' by NumPiece */
// TODO:MODEL
app.post('/saveDemandeSpecial',async(req,res)=>{
	let db2=new Db2();
	
	const demandeSpecial=(typeof(req.body.demandeSpecial)!="undefined")?req.body.demandeSpecial:[] ;
	const demSpecialStructure=(typeof(req.body.demSpecialStructure)!="undefined")?req.body.demSpecialStructure:[] ;
	const detailDs=(typeof(req.body.detailDs)!="undefined")?req.body.detailDs:[] ;
	const detailDsStructure=(typeof(req.body.detailDsStructure)!="undefined")?req.body.detailDsStructure:[] ;
	const myDemandeSpecialBE=new DemandeSpecialBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myDemandeSpecialBE.saveDemandeSpecial(demandeSpecial, demSpecialStructure, detailDs, detailDsStructure);
	res.json(r);
	notifyAllClients(r);
})

/* '/getAllDSPat' */
app.post('/getAllDSPat',async(req,res)=>{
	let db2=new Db2();
	const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	const myDemandeSpecialBE=new DemandeSpecialBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myDemandeSpecialBE.getAllDSPat({day:day});
	res.json(r);                             
})

/* '/getDetailDSPat' */
app.post('/getDetailDSPat',async(req,res)=>{
	let db2=new Db2();
	const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	const myDemandeSpecialBE=new DemandeSpecialBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myDemandeSpecialBE.getDetailDSPat({day:day});
	res.json(r);                             
})


/* '/getAllTravaux' */
app.post('/getAllTravaux',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	const myTravauxBE=new TravauxBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myTravauxBE.getAllTravaux({idAnnee:defaultIdAnnee});
	res.json(r);                             
})

/* '/travauxSansFiche' */
app.post('/travauxSansFiche',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	const myTravauxBE=new TravauxBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myTravauxBE.getAllTravaux({idAnnee:defaultIdAnnee, IsChequerM:'non'});
	res.json(r);                             
})

/* '/travauxAvecFiche' */
app.post('/travauxAvecFiche',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	const myTravauxBE=new TravauxBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myTravauxBE.getAllTravaux({idAnnee:defaultIdAnnee, IsChequerM:'oui'});
	res.json(r);                             
})

/* '/getChequeMatiereData' */
app.post('/getChequeMatiereData',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	let idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	const myChequeMatiereBE=new ChequeMatiereBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myChequeMatiereBE.getChequeMatiereData({idAnnee:idAnnee});
	res.json(r);                             
})


/* '/getChequeMatiereByProductId' */
app.post('/getChequeMatiereByProductId',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	let productId=(typeof(req.body.productId)!="undefined")?req.body.productId:defaultIdAnnee ;
	// console.log(productId);
	const myChequeMatiereBE=new ChequeMatiereBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myChequeMatiereBE.getChequeMatiereByProductId({productId:productId});
	res.json(r);                             
})

/* '/getChequeMatiereSerieProdData' */
app.post('/getChequeMatiereSerieProdData',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	// let idAnnee=(typeof(req.body.idAnnee)!="undefined")?req.body.idAnnee:defaultIdAnnee ;
	let NumChqMSerie=(typeof(req.body.NumChqMSerie)!="undefined")?req.body.NumChqMSerie:"" ;
	let ProductId=(typeof(req.body.ProductId)!="undefined")?req.body.ProductId:0 ;
	const myChequeMatiereBE=new ChequeMatiereBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myChequeMatiereBE.getChequeMatiereSerieProdData({NumChqMSerie:NumChqMSerie, ProductId:ProductId});
	res.json(r);                             
})

/* '/getDetailChequeMatiereSerieData' */
app.post('/getDetailChequeMatiereSerieData',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	let NumChqMSerie=(typeof(req.body.NumChqMSerie)!="undefined")?req.body.NumChqMSerie:"" ;
	const myChequeMatiereBE=new ChequeMatiereBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myChequeMatiereBE.getDetailChequeMatiereSerieData({NumChqMSerie:NumChqMSerie});
	res.json(r);                             
})

/* '/getDetailChequeMatiereWithProductId' */
app.post('/getDetailChequeMatiereWithProductId',async(req,res)=>{
	let db2=new Db2();
	// const day=(typeof(req.body.day)!="undefined")?req.body.day:"" ;
	let NumChqMSerie=(typeof(req.body.NumChqMSerie)!="undefined")?req.body.NumChqMSerie:"" ;
	const myChequeMatiereBE=new ChequeMatiereBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await myChequeMatiereBE.getDetailChequeMatiereWithProductId({NumChqMSerie:NumChqMSerie});
	res.json(r);                             
})

/* '/saveChequeMatiereSerie' */
// TODO:583
app.post('/saveChequeMatiereSerie',async(req,res)=>{
	let db2=new Db2();
	const myChequeMatiereBE=new ChequeMatiereBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	// console.log(req.body);
	let r=await myChequeMatiereBE.saveChequeMatiereSerie(req.body);
	// r=req.body
	res.json(r);                             
})

// 
/* '/addArticle' */
// TODO:583
app.post('/addArticle',async(req,res)=>{
	let db2=new Db2();
	const myArticleBE=new articleBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	// console.log(req.body);
	let r=await myArticleBE.addArticle(req.body);
	// r=req.body
	res.json(r);                             
})

/* getList movementStock */

app.post('/getListMouvementStock',async(req,res)=>{
	let db2=new Db2();
	const mymouvementStockBE=new mouvementStockBE( odbc, res, req, {conStr:db2.cs, dependencyes:dependencyes}	);
	const r=await mymouvementStockBE.getList();
	res.json(r);                             
})

// 

// Charger les certificats
// const options = {
  // key: fs.readFileSync('certs/server.key'),
  // cert: fs.readFileSync('certs/server.cert')
// };

 let adr='127.0.0.1';
 // let adr='192.168.0.89';
// https.createServer(options, app).listen(port, adr, () => {
  // console.log(`Serveur HTTPS démarré sur https://${adr}:${port}`);
// });
 // app.listen(port, '127.0.0.1', () => {
  // console.log(`Server is running at http://127.0.0.1:${port}`);
// }); 
function notifyAllClients(message) {
  clients.forEach(client => {
    if (client.readyState === ws.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

const server=http.createServer(app);
const wss=new ws.Server({server})
let clients=[];
wss.on('connection',function(ws){
	clients.push(ws);
	console.log("client connecté");
})
wss.on('close',()=>{
	clients=clients.filter(client=>client!==ws)
	console.log("client déconnecté");
})

// 3️⃣ Lancer le serveur HTTP (et WebSocket en même temps)
server.listen(port, adr, () => {
  console.log(`✅ Serveur Express + WebSocket actif sur http://${adr}:${port}`);
});