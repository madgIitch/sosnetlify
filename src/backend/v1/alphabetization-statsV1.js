const BASE_API_URL = "/api/v1";

var alphabetization_stats = [
    {
        country: "argentina",
        year: 1991,
        ar_ym: 98,
        ar_yw: 98,
        ar_ty: 98
    },
    {
        country: "burkina faso",
        year: 2005,
        ar_ym: 40,
        ar_yw: 26,
        ar_ty: 33
    },
    {
        country: "eeuu",
        year: 1990,
        ar_ym: 97,
        ar_yw: 91,
        ar_ty: 94
    },
    {
        country: "bangladesh",
        year: 2013,
        ar_ym: 84,
        ar_yw: 87,
        ar_ty: 85
    },
    {
        country: "chad",
        year: 2016,
        ar_ym: 41,
        ar_yw: 22,
        ar_ty: 31
    },
    {
        country: "guatemala",
        year: 2018,
        ar_ym: 95,
        ar_yw: 94,
        ar_ty: 95
    },
    {
        country: "indonesia",
        year: 2020,
        ar_ym: 100,
        ar_yw: 100,
        ar_ty: 100
    },
    {
        country: "liberia",
        year: 2017,
        ar_ym: 65,
        ar_yw: 46,
        ar_ty: 55
    },
    {
        country: "mauritania",
        year: 2017,
        ar_ym: 71,
        ar_yw: 57,
        ar_ty: 64
    }

];

module.exports.register = (app,db) => {
    app.get(BASE_API_URL+"/alphabetization-stats/docs",(req,res)=>{
        res.redirect("https://documenter.getpostman.com/view/19594199/UVysxFuz")
    });

    app.get(BASE_API_URL + "/alphabetization-stats/loadInitialData", (req, res) => {
        db.insert(alphabetization_stats);
        res.send(JSON.stringify(alphabetization_stats, null, 2));
    });

    app.get(BASE_API_URL + "/alphabetization-stats",(req, res)=>{
        var year = req.query.year;
        var from = req.query.from;
        var to = req.query.to;

        //Comprobamos query
        for(var i = 0; i<Object.keys(req.query).length;i++){
            var element = Object.keys(req.query)[i];
            if(element != "year" && element != "from" && element != "to" && element != "limit" && element != "offset"){
                res.sendStatus(400, "BAD REQUEST");
                return;
            }
        }

        //Comprobamos si from es mas pequeño o igual a to
        if(from>to){
            res.sendStatus(400, "BAD REQUEST");
            return;
        }
        db.find({},function(err, newRegis){
            if(err){
                res.sendStatus(500, "ERROR EN CLIENTE");
                return;
            }
            // Apartado para búsqueda por año
            if(year != null){
                var newRegis = newRegis.filter((reg)=>
                {
                    return (reg.year == year);
                });
                if (newRegis==0){
                    res.sendStatus(404, "NO EXISTE");
                    return;
                }
            }
    
            // Apartado para from y to
            if(from != null && to != null){
                newRegis = newRegis.filter((reg)=>
                {
                    return (reg.year >= from && reg.year <=to);
                });
                if (newRegis==0){
                    res.sendStatus(404, "NO EXISTE");
                    return;
                }
            }
    
            if(req.query.limit != undefined || req.query.offset != undefined){
                newRegis = paginacion(req,newRegis);
            }
            newRegis.forEach((element)=>{
                delete element._id;
            });
            res.send(JSON.stringify(newRegis,null,2));
        })
    });

    // GET por país
    app.get(BASE_API_URL + "/alphabetization-stats/:country",(req, res)=>{
    
        var country =req.params.country;
        var from = req.query.from;
        var to = req.query.to;

        //Comprobamos query
        for(var i = 0; i<Object.keys(req.query).length;i++){
            var element = Object.keys(req.query)[i];
            if(element != "from" && element != "to"){
                res.sendStatus(400, "BAD REQUEST");
                return;
            }
        }

        //Comprobamos si from es mas pequeño o igual a to
        if(from>to){
            res.sendStatus(400, "BAD REQUEST");
            return;
        }

        db.find({}, function(err,newRegis){
            
            if(err){
                res.sendStatus(500, "ERROR EN CLIENTE");
                return;
            }
            newRegis = newRegis.filter((reg)=>
            {
                return (reg.country == country);
            });
        
            // Apartado para from y to
            var from = req.query.from;
            var to = req.query.to;
    
            //Comprobamos si from es mas pequeño o igual a to
            if(from>to){
                res.sendStatus(400, "BAD REQUEST");
                return;
            }
        
            if(from != null && to != null && from<=to){
                newRegis = newRegis.filter((reg)=>
                {
                   return (reg.year >= from && reg.year <=to);
                }); 
                
            }
            //COMPROBAMOS SI EXISTE
            if (newRegis==0){
                res.sendStatus(404, "NO EXISTE");
                return;
            }
            //RESULTADO
            if(req.query.limit != undefined || req.query.offset != undefined){
                newRegis = paginacion(req,newRegis);
            }
            newRegis.forEach((element)=>{
                delete element._id;
            });
            res.send(JSON.stringify(newRegis,null,2));
        })

    });
    
    // GET por país y año
    
    app.get(BASE_API_URL+"/alphabetization-stats/:country/:year",(req, res)=>{
    
        var country =req.params.country
        var year = req.params.year

        db.find({},function(err, newRegis){

            if(err){
                res.sendStatus(500, "ERROR EN CLIENTE");
                return;
            }

            newRegis = newRegis.filter((reg)=>
            {
                return (reg.country == country && reg.year == year);
            });
            if (newRegis==0){
                res.sendStatus(404, "NO EXISTE");
                return;
            }
    
            //Paginación
            if(req.query.limit != undefined || req.query.offset != undefined){
                newRegis = paginacion(req,newRegis);
                res.send(JSON.stringify(newRegis,null,2));
            }
            newRegis.forEach((element)=>{
                delete element._id;
            });
            res.send(JSON.stringify(newRegis[0],null,2));
        });

    });

    function paginacion(req, lista){
        var res = [];
        const limit = req.query.limit;
        const offset = req.query.offset;
        if(limit < 1 || offset < 0 || offset > lista.length){
            res.push("ERROR EN PARAMETROS LIMIT Y/O OFFSET");
            return res;
        }
        res = lista.slice(offset,parseInt(limit)+parseInt(offset));
        return res;
    };

     app.post(BASE_API_URL + "/alphabetization-stats",(req, res)=>{
        
        if(parametroscorrectos(req)){
            res.sendStatus(400,"BAD REQUEST - Parametros incorrectos");
        }else{
            db.find({},function(err,regisNew){
                if(err){
                    res.sendStatus(500, "ERROR EN CLIENTE");
                    return;
                }
                regisNew = regisNew.filter((reg)=>
                {
                    return(req.body.country == reg.country && req.body.year == reg.year)
                })
                if(regisNew.length != 0){
                    res.sendStatus(409,"CONFLICT");
                }else{
                    db.insert(req.body);
                    res.sendStatus(201,"CREATED");
                }
            })
        }
    
    });


    app.post(BASE_API_URL + "/alphabetization-stats/:country", (req, res) => {
        res.sendStatus(405, "Method not allowed");
    });
    app.post(BASE_API_URL + "/alphabetization-stats/:year", (req, res) => {
        res.sendStatus(405, "Method not allowed");
    });

    function parametroscorrectos(req) {
        return (req.body.country == null |
            req.body.year == null |
            req.body.ar_ym == null |
            req.body.ar_yw == null |
            req.body.ar_ty == null);
    };

    app.delete(BASE_API_URL + "/alphabetization-stats", (req,res)=>{
        db.remove({}, {multi:true}, (err, numRegRemoved)=>{
		if (err){
			console.error("ERROR deleting DB registrations in DELETE: "+err);
			res.sendStatus(500);
		}else{
			if(numRegRemoved==0){
				console.error("registration-stats not found");
				res.sendStatus(404);
			}else{
				res.sendStatus(200);
			}
		}
			
	    });
    });


    app.delete(BASE_API_URL + "/alphabetization-stats/:country", (req, res) => { //borrar todos los recursos
        var countryName = req.params.country;
        registration_stats.filter((cont) => {
            return (cont.country != countryName);
        });
        res.sendStatus(200, "OK");
    });

    app.delete(BASE_API_URL+"/alphabetization-stats/:country/:year",(req, res)=>{
        var countryR = req.params.country;
        var yearR = req.params.year;
        db.find({country: countryR, year: parseInt(yearR)}, {}, (err, filteredList)=>{
            if (err){
                res.sendStatus(500,"ERROR EN CLIENTE");
                return;
            }
            if(filteredList==0){
                res.sendStatus(404,"NOT FOUND");
                return;
            }
            db.remove({country: countryR, year: parseInt(yearR)}, {}, (err, numRemoved)=>{
                if (err){
                    res.sendStatus(500,"ERROR EN CLIENTE");
                    return;
                }
            
                res.sendStatus(200,"DELETED");
                return;
                
            });
        });
    });

    app.put(BASE_API_URL + "/alphabetization-stats", (req, res) => {
        res.sendStatus(405, "Method Not Allowed");
    });

    app.put(BASE_API_URL + "/alphabetization-stats/:country/:year",(req, res)=>{
        
        //COMPROBAMOS FORMATO JSON
        if(parametroscorrectos(req)){
            res.sendStatus(400,"BAD REQUEST - Parametros incorrectos");
            return;
        }
        
        var countryRegis = req.params.country;
        var yearRegis = req.params.year;
        var body = req.body;  

        db.find({},function(err,regisNew){
            if(err){
                res.sendStatus(500, "ERROR EN CLIENTE");
                return;
            }
            //COMPROBAMOS SI EXISTE EL ELEMENTO
            regisNew = regisNew.filter((reg)=>
            {
                return (reg.country == countryRegis && reg.year == yearRegis);
            });
            if (regisNew==0){
                res.sendStatus(404, "NO EXISTE");
                return;
            }

            //COMPROBAMOS SI LOS CAMPOS ACTUALIZADOS SON IGUALES
            if(countryRegis != body.country || yearRegis != body.year){
                res.sendStatus(400,"BAD REQUEST");
                return;
            }

            //ACTUALIZAMOS VALOR
            db.update({$and:[{country: String(countryRegis)}, {year: parseInt(yearRegis)}]}, {$set: body}, {},function(err, numUpdated) {
                if (err) {
                    res.sendStatus(500, "ERROR EN CLIENTE");
                }else{
                    res.sendStatus(200,"UPDATED");
                }
            });
        })
    })
};