class FactureBE{
	constructor( odbc, res, req, options={}	){
		const{
			CIN="",
			mois="",
			conStr="",
			dependencyes=[],
			idAnnee=2025
		}=options;

		/* this.CIN=CIN;*/
		this.mois=mois; 
		this.idAnnee=idAnnee;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
		this.tableName="CLIENT";
	}
	
	async getData(options={}){
		const{q="SELECT CLIENT.*, CLIENT.NomClient, BONCOMMANDE.ResteAPayer FROM CLIENT INNER JOIN BONCOMMANDE ON CLIENT.IdClient = BONCOMMANDE.IdClient WHERE (((BONCOMMANDE.ResteAPayer)>0) AND ((BONCOMMANDE.DateBC) Like '%2024%')) OR (((BONCOMMANDE.ResteAPayer)>0) AND ((BONCOMMANDE.DateBC) Like '%"+this.idAnnee+"%')) ORDER BY CLIENT.NomClient; "
		}=options;
		// console.log(q);
		
		var tableStructureBE=this.dependencyes.tableStructureBE;
		const mytableStructure=new tableStructureBE( this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois, CIN:this.CIN, idAnnee:this.idAnnee, dependencyes:this.dependencyes}	);
		
		try{
			let con= await this.odbc.connect(this.conStr);
			let r=await con.query(q);
			// console.log(r)
			let r1={data:[],structure:{}};
			r1.structure=await mytableStructure.getTableStructurefromR({ars:r});
			let i=0
			while(typeof(r[i])!="undefined"){
				// console.log(r[i])
				r1.data.push(r[i]);
				i++;
			}
			// console.log(r1);
			return r1;
			
		}catch(err){
			throw err
		}
		
		// 
	}
	
	async getDetailFacture(options={}){
		const{NumFact=""}=options
		try{
			let q1="SELECT TOP 1 DETAILFACTURE2.*, DETAILFACTURE2.IdDatailFactur2 FROM DETAILFACTURE2 ORDER BY DETAILFACTURE2.IdDatailFactur2 DESC;";
			let q2="SELECT DETAILFACTURE2.* FROM DETAILFACTURE2 WHERE (((DETAILFACTURE2.NumFact)='"+NumFact+"')); ";
			let q=(NumFact==="")?q1:q2;
			return await this.getData({q:q});
		}catch(err){
			console.log(err)
		}
		
	}
	
	async getListFacture(options={}){
		const{IdClient=0}=options
		try{
			let prevAnnee=parseInt(this.idAnnee)-1
			let q="SELECT FACTURE2.*, FACTURE2.IdClient, FACTURE2.DateFactur FROM FACTURE2 WHERE (((FACTURE2.IdClient)="+IdClient+") AND ((FACTURE2.DateFactur) Like '%"+prevAnnee+"%')) OR (((FACTURE2.IdClient)="+IdClient+") AND ((FACTURE2.DateFactur) Like '%"+this.idAnnee+"%')); ";
			return await this.getData({q:q});
		}catch(err){
			console.log(err)
		}
		
	}

/* get nombre actuelle de facture sur l'annee couranthromePo */
	async getCountFacture(options={}){
		const{}=options
		try{
			let q="SELECT Count(FACTURE2.NumFact) AS [count] FROM FACTURE2 WHERE (((FACTURE2.DateFactur) Like '%"+this.idAnnee+"%'));";
			return await this.getData({q:q})
		}catch(err){
			console.log(err)
		}
		
	}

	/* important rowFacture is a single Object,i d to push it in an array to allow it manage by avanceBe.prepareInsert */
	async addRowFacture(options={}){
		const{rowFacture={}, struct={}}=options
		try{
			// console.log(rowFacture)
			let a=[];
			a.push(rowFacture);
			let avanceBE=this.dependencyes["avanceBE"];
			let myAv=new avanceBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
			let q=await myAv.prepareInsert(a, {struct:struct, tableKey:"IdFactur2", tableName:"FACTURE2"});
			let r=await myAv.orderInsert(q);
			r=rowFacture;
			return r;
			
		}catch(err){
			console.log(err)
		}
		
	}
	
	async addDetailFacture(options={}){
		const{
			struct=struct, 
			arDetailFacture=arDetailFacture
		}=options
		try{
			let avanceBE=this.dependencyes["avanceBE"];
			let myAv=new avanceBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
			let q=await myAv.prepareInsert(arDetailFacture, {struct:struct, tableKey:"IdDatailFactur2", tableName:"DETAILFACTURE2"});
			let r=await myAv.orderInsert(q);
			return r
		}catch(err){
			console.log(err)
		}
		
	}

	prepareWHERE(ar,options={}){
		const{champName="DETAILFACTURE2.ProductId"}=options
		let s="";
		let i=0;
		
		ar.forEach((v,k)=>{
			s+=(i===0)?"(("+champName+")="+v+")":" OR (("+champName+")="+v+")";
			i++;
		})
		return "( "+s+" )";
	}

	async getDetailFacture2(options={}){
		const{arIdProduct=[""]}=options
		try{
			let w=this.prepareWHERE(arIdProduct);
			// let q="SELECT * FROM DETAILFACTURE2 ;";
			let q="SELECT DETAILFACTURE2.* FROM DETAILFACTURE2 WHERE "+w+";";
			let rep=await this.getData({q:q});
			// console.log(rep)
			return rep;
		}catch(err){
			console.log(err)
		}
		
	}

	async getFactureinfo(NumFact){
			try{
				let q="SELECT FACTURE2.* FROM FACTURE2 WHERE (((FACTURE2.NumFact)='"+NumFact+"')); ";
				
				let rep=await this.getData({q:q});
				// console.log(rep)
				return rep;
				
			}catch(err){
				console.log(err)
			}
			
	}
	
	async getDetailFacture3(NumFact){
			try{
				let q="SELECT DETAILFACTURE2.* FROM DETAILFACTURE2 WHERE (((DETAILFACTURE2.NumFact)='"+NumFact+"')); ";
				// console.log(q);
				let rep=await this.getData({q:q});
				return rep;
				
			}catch(err){
				console.log(err)
			}
			
	}

	async getFacturesImpayees(options={}){
		const{}=options
		try{
			let q="SELECT FACTURE2.* FROM FACTURE2 WHERE (((FACTURE2.ResteAPayer)>0)); ";
			 q="SELECT FACTURE2.* FROM FACTURE2 ; ";
			let rep=await this.getData({q:q});
				return rep;
		}catch(err){
			console.log(err)
		}
		
	}

}

module.exports=FactureBE;