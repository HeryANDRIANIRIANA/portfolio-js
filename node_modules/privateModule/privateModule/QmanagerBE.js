class QmanagerBE{
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
	}
	
	async getData(options={}){
		const{q=""
		}=options;
		// console.log(q);
		var tableStructureBE=this.dependencyes.tableStructureBE;
		const mytableStructure=new tableStructureBE( this.odbc, this.res, this.req, {conStr:this.conStr, mois:this.mois, CIN:this.CIN, idAnnee:this.idAnnee, dependencyes:this.dependencyes}	);
		
		try{
			let con= await this.odbc.createConnection(this.conStr);
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
			con.close()
			return r1;
			
		}catch(err){
			throw err
		}
		
		// 
	}
			
	async prepareInsert(a, options={}){
		const{
			struct={},
			tableKey="NumOrdreAvance",
			tableName="AVANCE"
		}=options;
		// console.log(struct);
		const avStruct=(Object.keys(struct).length===0)?await this.getData():struct;
		// console.log(avStruct.structure.colDesc);
		// console.log(avStruct);
		let colDesc=avStruct.structure.colDesc;
		// console.log("colDesc="+colDesc)
		let s1="";
		let s2="";
		let s0="";
		let arq=[];
		// console.log(a);
		for(let i=0; i<a.length; i++){
			let ar0=[];
			let ar1=[];
			for(let o of Object.keys(a[i])){
				 // console.log(colDesc[o]["dataType"])
				if(typeof(colDesc[o])!="undefined" && o!=tableKey && o!="NomPrenom"){
					ar0.push(o);
					let v2=(colDesc[o]["dataType"]<0)?"'"+a[i][o]+"'":a[i][o];
					ar1.push(v2);
				}
			}
			s1=ar0.toString();
			s2=ar1.toString();
			s0="INSERT INTO "+tableName+" ( "+s1+" ) VALUES ( "+s2+" ) ;"
			// console.log(s0)
			arq.push(s0);
		}
		return arq;
	}
		
	async prepareUpdate(rows, options={}){
		const{tableName="AVANCE", id="NumOrdreAvance"}=options;
		try{
			let ar=[]
			for(let o of rows){
				
				let arKs=Object.keys(o);
				let s1="UPDATE "+tableName+" SET ";
				let ksMaped=arKs.map((k)=>{
					let s="";
					// if(k!==id && k!=="undefined"){
						
						let v=(typeof(o[k])=="string")?"'"+o[k]+"'":o[k] ;
						s=" "+tableName+"."+k+"="+v
						return s;
					// }
					
				} );
				// console.log(arKs)
				s1=(typeof(o[id])!=="string")?s1+ksMaped.toString()+" WHERE ((("+tableName+"."+id+" )="+o[id]+")) ":s1+ksMaped.toString()+" WHERE ((("+tableName+"."+id+" )='"+o[id]+"')) ";
				ar.push(s1);
			}
			return ar;
		}catch(err){
			throw err
		}
	}
	
	async orderInsert(insertQ){
		try{
			const con=await this.odbc.createConnection(this.conStr);
			for(let q of insertQ){
				 // console.log(q);
				let r=await con.query(q);
				 // console.log(r);
			}
			con.close();
			return 'OK';
		}catch(err){
			console.log(insertQ);
			throw err;
		}
	}
	
	async addRow(options={}){
		const{ar=[] , structure={},
		 tableKey="RangPiece", tableName="PIECE"
		}=options
		try{
			let o={structure:structure}
			let q=await this.prepareInsert(ar,{struct:o, tableKey:tableKey, tableName:tableName} );
			// console.log(q);
			let r=await this.orderInsert(q);
			// console.log(r);
			return r;
		}catch(err){
			console.log(err)
		}
		
	}
	
}
module.exports=QmanagerBE;