class chequeMatiereBE{
	constructor( odbc, res, req, options={}	){
		const{			
			mois="",
			conStr="",
			dependencyes=[],
			idAnnee=2025
		}=options;
		
		this.mois=mois; 
		this.idAnnee=idAnnee;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
		this.tableName="CHEQUEMATIERESERIE";
		let CQmanagerBE=this.dependencyes["QmanagerBE"];
		this.Qman=new CQmanagerBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
		let myDateBE=new this.dependencyes["dateBE"];
		this.defaultDate=myDateBE.defaultDate();
		this.defaultDate2=myDateBE.defaultDate2();
		
	}
	
	async getChequeMatiereData(options={}){
		const{idAnnee=this.idAnnee}=options
		try{
			let q="SELECT CHEQUEMATIERESERIE.* FROM CHEQUEMATIERESERIE WHERE (((CHEQUEMATIERESERIE.DateCHQMSerie) Like '%"+idAnnee+"%')); "
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getChequeMatiereByProductId(options={}){
		const{productId=0,idAnnee=this.idAnnee}=options
		try{
			let q=(productId!==0)?"SELECT CHEQUEMATIERESERIE.* FROM CHEQUEMATIERESERIE INNER JOIN CHQMSERIEPROD ON CHEQUEMATIERESERIE.NumChqMSerie = CHQMSERIEPROD.NumChqMSerie WHERE (((CHQMSERIEPROD.ProductId)="+productId+")); ":"SELECT CHEQUEMATIERESERIE.*, CHQMSERIEPROD.ProductId, CHEQUEMATIERESERIE.DateCHQMSerie FROM CHEQUEMATIERESERIE INNER JOIN CHQMSERIEPROD ON CHEQUEMATIERESERIE.NumChqMSerie = CHQMSERIEPROD.NumChqMSerie WHERE (((CHEQUEMATIERESERIE.DateCHQMSerie) Like '%"+idAnnee+"%')); ";
			// console.log(q);
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getCountChequeMatiere(options={}){
		const{idAnnee=this.idAnnee}=options
		try{
			let q="SELECT Count(*) AS count FROM CHEQUEMATIERESERIE WHERE (((CHEQUEMATIERESERIE.DateCHQMSerie) Like '%"+idAnnee+"%')); "
			let r=await this.Qman.getData({q:q});
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getChequeMatiereSerieProdData(options={}){
		const{NumChqMSerie="",ProductId=0}=options
		try{
			let q="";
			let wq="";
			wq=(ProductId!==0 && NumChqMSerie==="")?"WHERE (((CHQMSERIEPROD.ProductId)="+ProductId+"))":"";
			wq=(NumChqMSerie!=="" && ProductId===0)?"WHERE (((CHQMSERIEPROD.NumChqMSerie)="+NumChqMSerie+"))":"";
			if(wq===""){
				q="SELECT TOP 1 CHQMSERIEPROD.* FROM CHQMSERIEPROD"
			}else{
				q="SELECT CHQMSERIEPROD.*, CHQMSERIEPROD.NumChqMSerie FROM CHQMSERIEPROD "+wq
			}
			let r=await this.Qman.getData({q:q});
			return r;
 
		}catch(err){
			console.log(err)
		}
	}
	
	async getDetailChequeMatiereSerieData(options={}){
		const{NumChqMSerie=""}=options
		try{
			let wq=(NumChqMSerie!=="")?"WHERE (((DETAILCHQMSERIE.NumChqMSerie)='"+NumChqMSerie+"'))":"";
			let q=(wq!=="")?"SELECT DETAILCHQMSERIE.*, DETAILCHQMSERIE.NumChqMSerie FROM DETAILCHQMSERIE "+wq:"SELECT TOP 1 DETAILCHQMSERIE.* FROM DETAILCHQMSERIE";
			let r=await this.Qman.getData({q:q});
			return r;
			
			}catch(err){
			console.log(err)
		}
		
	}
	
	async getDetailChequeMatiereWithProductId(options={}){
		const{NumChqMSerie= "",idAnnee=this.idAnnee }=options
		try{
			let wq=(NumChqMSerie!=="")?"AND ((CHEQUEMATIERESERIE.NumChqMSerie)='"+NumChqMSerie+"')":"";
			let q="SELECT CHEQUEMATIERESERIE.DateCHQMSerie, DETAILCHQMSERIE.*, CHQMSERIEPROD.ProductId, CHEQUEMATIERESERIE.NumChqMSerie FROM (CHEQUEMATIERESERIE INNER JOIN CHQMSERIEPROD ON CHEQUEMATIERESERIE.NumChqMSerie = CHQMSERIEPROD.NumChqMSerie) INNER JOIN DETAILCHQMSERIE ON CHEQUEMATIERESERIE.NumChqMSerie = DETAILCHQMSERIE.NumChqMSerie WHERE (((CHEQUEMATIERESERIE.DateCHQMSerie) Like '%"+idAnnee+"%') "+wq+" ); ";
			let r=await this.Qman.getData({q:q});
			return r;

		}catch(err){
			console.log(err)
		}
		
	}
	
	async saveChequeMatiereSerie(options={}){
		const{
			arNewDetailChequeMatiere=[],
			chequeMatiereSerieProdStructur={},
			chequeMatiereStructur={},
			detailChequeMatiereStructur={},
			newChequeMatiereSerie={},
			oper='add'
			}=options
		try{
			//adding to db
			let NumChqMSerie=newChequeMatiereSerie["NumChqMSerie"];
			if(NumChqMSerie===""){
				let count=0
				let count0 =await this.getCountChequeMatiere();
				count=count0.data[0].count;
				NumChqMSerie=this.buildNumChqMSerie(count);
				
			}
			newChequeMatiereSerie.DateCHQMSerie=this.defaultDate; 
			newChequeMatiereSerie.NumChqMSerie=NumChqMSerie;
			newChequeMatiereSerie.QteComa=newChequeMatiereSerie.QteCom;
			newChequeMatiereSerie.ValiderCHQMSerie="Non";
			let ar=[];
			let q='';
			let r='';
			let rows=[];
			ar=[newChequeMatiereSerie]
			// console.log(oper);
			switch(oper){
				case 'add':
				/* CHEQUEMATIERESERIE */
				q= await this.Qman.prepareInsert(ar,{struct:{structure:chequeMatiereStructur}, tableKey:"RangCHQMSerie", tableName:"CHEQUEMATIERESERIE"})
				r= await this.Qman.orderInsert(q);
				/* CHQMSERIEPROD */
				q= await this.Qman.prepareInsert(ar,{struct:{structure:chequeMatiereSerieProdStructur}, tableKey:"RangCHQM", tableName:"CHQMSERIEPROD"})
				r=await this.Qman.orderInsert(q);
				/* DETAILCHQMSERIE */
				for (let o of arNewDetailChequeMatiere) {
				  o.NumChqMSerie=NumChqMSerie;
				}
				q= await this.Qman.prepareInsert(arNewDetailChequeMatiere,{struct:{structure:detailChequeMatiereStructur}, tableKey:"RangDet", tableName:"DETAILCHQMSERIE"})
				r= await this.Qman.orderInsert(q);
				// ProductId, IsChequerM
				// update detailCommande
				rows=[{IsChequerM:NumChqMSerie, ProductId:newChequeMatiereSerie.ProductId}]
				q= await this.Qman.prepareUpdate(rows,{tableName:"DETAILCOMMANDE",id:"ProductId"})
				r= await this.Qman.orderInsert(q);
				break;
				case 'update':
				rows=[{Demandeur:newChequeMatiereSerie.Demandeur,NumChqMSerie:newChequeMatiereSerie.NumChqMSerie}]
				q=await this.Qman.prepareUpdate(rows,{tableName:"CHEQUEMATIERESERIE",id:"NumChqMSerie"})
				r= await this.Qman.orderInsert(q);
				
				rows=[{CodeArticle:'DELETED',NumChqMSerie:newChequeMatiereSerie.NumChqMSerie}]
				q=await this.Qman.prepareUpdate(rows,{tableName:"DETAILCHQMSERIE",id:"NumChqMSerie"})
				r= await this.Qman.orderInsert(q);
				
				for (let o of arNewDetailChequeMatiere) {
				  o.NumChqMSerie=NumChqMSerie;
				}
				// console.log(arNewDetailChequeMatiere);
				q= await this.Qman.prepareInsert(arNewDetailChequeMatiere,{struct:{structure:detailChequeMatiereStructur}, tableKey:"RangDet", tableName:"DETAILCHQMSERIE"})
				r= await this.Qman.orderInsert(q);
				
				break;
				
			}
			
			return {NumChqMSerie:NumChqMSerie,DateCHQMSerie:this.defaultDate} ;
		}catch(err){
			console.log(err)
		}
		
	}
	
	buildNumChqMSerie(c){
		// c: count of chequeMatier in a year
		c++;
		let str='F-'+c+'/25'+' ('+this.defaultDate2+')' ;
		return str;
	}
	
}
module.exports = chequeMatiereBE