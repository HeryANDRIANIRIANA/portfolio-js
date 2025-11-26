class article{
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
		this.tableName="tarticle";
		let CQmanagerBE=this.dependencyes["QmanagerBE"];
		this.Qman=new CQmanagerBE( this.odbc, this.res, this.req, {conStr:this.conStr,  dependencyes:this.dependencyes}	);
	}
	
	async getListArticle(options={}){
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
	
	async getProfileData(options={}){
		const{}=options
		try{
			let q="SELECT * FROM PROFILEDSP"
			// console.log(q);
			let r=await this.Qman.getData({q:q});
			return r
		}catch(err){
			console.log(err)
		}
		
	}
	
	async addArticle(opt={}){
		try{
			// console.log(opt);
			let a=opt.curentArticle;
			let struct=opt;			
			let q=await this.Qman.prepareInsert(a,{tableKey:"IdArticle" , baseName:this.conStr.database, tableName:this.tableName , struct:struct})
			
			let r=await this.Qman.orderInsert(q)
			return r;
		}catch(err){                             
			console.log(err);
		}
	}
	
	async delArticle(opt={}){
		try{
			let a=opt.curentArticle;
			console.log(a);
			let q=await this.Qman.prepareDelete({tableKey:"IdArticle", keyValue:a[0]['IdArticle'], baseName:this.conStr.database, tableName:this.tableName})
			// q=["DELETE FROM tarticle WHERE IdArticle = 4;"]
			console.log(q);
			// return 0
			let r=await this.Qman.orderInsert(q)
			return r
		}catch(err){
			console.log(err);
		}
	}
	
	async updtArticle(opt={}){
		try{
			let a=opt.curentArticle;
			let colNames=opt.structure.colNames
			let q=await this.Qman.prepareUpdate(a,{id:"IdArticle", keyValue:a['IdArticle'], baseName:this.conStr.database, tableName:this.tableName, colNames:colNames})
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
module.exports=article