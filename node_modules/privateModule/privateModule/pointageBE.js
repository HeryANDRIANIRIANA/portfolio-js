class pointageBE{
	constructor( odbc, res, req, options={}	){
		const{
			CIN="",
			mois="",
			conStr="",
			dependencyes=[]
		}=options;

		this.CIN=CIN;
		this.mois=mois;
		this.odbc=odbc;
		this.res=res;
		this.req=req;
		this.dependencyes=dependencyes;
		this.conStr=conStr;
		this.tableName="POINTAGE2";
	}
	
	async getData(){
		let M=this.mois;
		let q="SELECT * FROM "+this.tableName+" WHERE ( ("+this.tableName+".Mois)='"+M+"' )";
		var avanceBE=this.dependencyes.avanceBE;
		const myAvance=new avanceBE( this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois, CIN:this.CIN, dependencyes:this.dependencyes}	);
		
		try{
			let con= await this.odbc.connect(this.conStr);
			let r=await con.query(q);
			// con.close()
			let r1={data:[],structure:{}};
			r1.structure=await myAvance.getTableStructurefromR({ars:r});
			let i=0
			while(typeof(r[i])!="undefined"){
				r1.data.push(r[i]);
				i++;
			}
			return r1;
		}catch(err){
			throw err
		}
		
		// 
	}
	
	async checkId(){
		try{
			let id=0;
			let id1=await this.getData();
			id=(typeof(id1.data[0])!="undefined")?id1.data[0]["idPointage2"]:id;
			
			return id;
		}catch(err){
			console.log(err)
		}
	}
	// myPtge.beforeInsert(rows)
	
	async beforeInsert(rows){ 
		try{
			let id=0;
			id=await this.checkId();
			// console.log(id);
			let r={}
			if(id===0){
				r= await this.insert(rows);
			}else{
				// r=await this.updt(id, rows);
				await this.delt(id);
				r= await this.insert(rows);
			}
			
			return r
		}catch(err){
			console.log(err)
		}
	}
	
	async insert(rows){
		try{
			
			let s1="Mois,"+Object.keys(rows).toString();
			let arS1=["'"+this.mois+"'"]
			for (let k of Object.keys(rows)){
				// console.log(rows[k].toString())
				// console.log(JSON.stringify(rows[k]); )
				// console.log(Object.values(rows[k]).toString())
				let s=(typeof(rows[k])=="string")?"'"+rows[k]+"'":rows[k];
				arS1.push(s)
			}
			let s2=arS1.toString();
			
			let q="INSERT INTO "+this.tableName+" ( "+s1+" ) VALUES ( "+s2+" ) ";
			let con=await this.odbc.connect(this.conStr);
			// console.log(q);
			let res=await con.query(q);
			// con.close() ;
			return res;
		}catch(err){
			console.log(err)
		}
		
	}
	
	async updt(id, rows){
		try{
			let setAr=[];
			for (let k of Object.keys(rows)){
				let s=k+"=";
				let r=rows[k];
				let s1=(typeof(r)=="string" )?"'"+r+"'":r;
				s+=s1;
				setAr.push(s)
			}
			let s2=setAr.toString();
			let q="UPDATE "+this.tableName+" SET "+s2+" WHERE ( ("+this.tableName+".IdPointage2)="+id+" ) ";
			// console.log(q)
			let con=await this.odbc.connect(this.conStr);
			let res=con.query(q) ;
			// console.log(res)
			con.close();
			return res; 
		}catch(err){
			console.log(err)
		}
	}

	async delt(id){
		try{
			let q="DELETE * FROM "+this.tableName+"  WHERE ( ("+this.tableName+".IdPointage2)="+id+" ) ";
			let con=await this.odbc.connect(this.conStr);
			let r=con.query(q);
			// con.close();
			return r;
		}catch(er){
			console.log(er)
		}
	}

}

module.exports=pointageBE;