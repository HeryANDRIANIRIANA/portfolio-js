export class ClassDataRectif{
	constructor(){
		let dt=new Date();
		this.idAnnee=dt.getFullYear()
	}
	
	async testConnection(){
		try{
			// console.log('test init');
			let url="/test"
			let data={}
			let r =await axios.post(url,data);
			return r;
			// console.log(r);
		}catch(err){
			console.log(err);
		}
	}
	
	async rectifyDataFromDb(o){
		let o1=o.data.data;
			if(o.data.data.length==0){
				let o2={};
				for(let colName of o.data.structure.colNames){
					// console.log(colName)
					let v=(o.data.structure.colDesc[colName].dataType<0)?"":0;
					o2[colName]=v;
				}
				o1.push(o2)
			}
		return o1;	
			// this.data=avanceD1;
			// window.avanceData=avanceD1;
	}
	
	async getData(options={}){
		const{
			gStruct="",
			IdClient=(typeof(window.clientSelected)!="undefined" && window.clientSelected.length>0 )? window.clientSelected[0].IdClient:0,
			url='/getBonCommandeData',
			data={
				IdClient:IdClient,
				idAnnee:this.idAnnee
			}
		}=options;
		
		// console.log(data)
		try{
			let r =await axios.post(url,data);
			if(gStruct!=""){
				window[gStruct]=r.data;
				// console.log(gStruct)
			}
			 // console.log(r.data.data)
			if(typeof(r.data.data)!=="undefined"){
				let r1=await this.rectifyDataFromDb(r);
				return r1;
			}
			else{
				return r
			}

			
		}catch(err){
			console.log(err)
		}
	}
}