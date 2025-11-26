class mouvementStockBE{
	constructor( odbc, res, req, options={}	){
		const{
			conStr="",
			dependencyes=[],
			// idAnnee=2025
		}=options;
		// this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
		this.tableName="tmouvement3";
		let CQmanagerBE=this.dependencyes["QmanagerBE"];
		this.Qman=new CQmanagerBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
	}
	
	async getList(options={}){
		const{}=options
		try{
			let q="SELECT * FROM "+this.tableName+""
			// console.log(q);
			let r=await this.Qman.getData({q:q});
			return r
		}catch(err){
			console.log(err)
		}
		
	}
	
	async addLine(opt={}){
		try{
			 // console.log(opt);
			let a=opt.currentMouvementStock;
			let dateBE=this.dependencyes["dateBE"]
			let myDt=new dateBE();
			let dt=myDt.defaultDate()
			a[0]["DateMouvement"]=dt
			// console.log(a);
			let struct={structure:opt.mouvementStockStructure} ;
		
			let q=await this.Qman.prepareInsert(a,{tableKey:"IdMouvement" , baseName:this.conStr.database, tableName:this.tableName , struct:struct})
			console.log(q);
			// let r=0
			let r=await this.Qman.orderInsert(q)
			return r;
		}catch(err){                             
			console.log(err);
		}
	}
	
	async delLine(opt={}){
		try{
			let a=opt.curentArticle;
			let q=await this.Qman.prepareDelete({tableKey:"IdArticle", keyValue:a['IdArticle'], baseName:this.conStr.database, tableName:this.tableName})
			// q=["DELETE FROM tarticle WHERE IdArticle = 4;"]
			console.log(q);
			// return 0
			let r=await this.Qman.orderInsert(q)
			return r
		}catch(err){
			console.log(err);
		}
	}
	
	async updtLine(opt={}){
		try{
			let a=opt.curentArticle;
			let q=await this.Qman.prepareUpdate(a,{id:"IdArticle", keyValue:a['IdArticle'], baseName:this.conStr.database, tableName:this.tableName})
			// console.log(q);
			// return 0
			let r=await this.Qman.orderInsert(q)
			return r
			return 0
		}catch(err){
			console.log(err);
		}
	}


}
module.exports=mouvementStockBE