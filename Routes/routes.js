const express = require('express')
const router = express.Router()
var dbquery=require('../database')
const bcrypt = require('bcrypt')
const { json, redirect, set } = require('express/lib/response')
var cookieParser = require('cookie-parser')
const auth = require("../middleware/auth")
const upload = require('../module/upload')
const readXlsxFile = require('read-excel-file/node')
const fs = require('fs');
const path = require('path')




router.get("/createuserform",auth,async (req,res)=>{
   var position = req.position
   if(await position != 'Admin'){
       res.json('You do not have permission')
         }
   
   return res.render('createuser.ejs')

})



router.get('/sql',auth,async function(req, res, next){
    var branch = re.branch
    var position = req.position
    var string1=`SELECT * FROM BP_DW_WIPNoTech where Branch = '${branch}' order by Tech asc,WIP asc`;
    var string2=`SELECT * FROM BP_DW_WIPNoTech order by Tech asc,WIP asc`;
    if(await position !='Admin'){
    dbquery.query(string1,async function (err, recordsets, fields) {
        var data =   JSON.stringify(recordsets)
        if (err) throw err;
        var    Jdata = JSON.parse(data);
        return res.render('table.ejs',{Jdata:Jdata});
  })}else{
    dbquery.query(string2,async function (err, recordsets, fields) {
        var data =   JSON.stringify(recordsets)
        if (err) throw err;
        var    Jdata = JSON.parse(data);
        return res.render('table.ejs',{Jdata:Jdata});;
  })
  }
});

router.get('/wip2tech' ,auth, async function(req, res, next){
    
    var branch = req.branch
    var position = req.position
    var string1= `Select * from BP_DW_WIP2TECH where Branch = '${branch}' order by WIP asc, OriginalTech asc`
    var string2 = `Select * from BP_DW_WIP2TECH order by WIP asc, OriginalTech asc`

    if(await position != 'Admin'){
    dbquery.query(string1,async function (err, recordsets, fields) {
        var data =   JSON.stringify(recordsets)
        if (err) throw err;
        var    Jdata = JSON.parse(data);
        return res.render('wip2tech.ejs',{Jdata:Jdata});;
  })
    }else{
        dbquery.query(string2,async function (err, recordsets, fields) {
            var data =   JSON.stringify(recordsets)
            if (err) throw err;
            var    Jdata = JSON.parse(data);
            return res.render('wip2tech.ejs',{Jdata:Jdata});;
      })

    }
});


router.post('/edit',auth, (req, res) => {
   const edit_wip = req.body.edit_WIP
   const edit_brand = req.body.edit_Brand
   const edit_tech = req.body.edit_Tech
   const edit_d = req.body.edit_Department
   res.render('editform.ejs',{data:{WIP:edit_wip,Brand:edit_brand,Tech:edit_tech,D:edit_d}})
   });

router.post('/editwip2tech',auth, (req, res) => {
    const edit_wip = req.body.edit_WIP
    const edit_brand = req.body.edit_Brand
    const edit_d = req.body.edit_Department
    const edit_branch = req.body.edit_Branch
    const edit_originaltech = req.body.edit_OriginalTech
    const edit_newltech = req.body.edit_Newtech

    res.render('editwip2tech.ejs',{data:
        {WIP:edit_wip,
        Brand:edit_brand,
        D:edit_d,
        Branch:edit_branch,
        OriginalTech:edit_originaltech,
        NewTech:edit_newltech}})
});


   router.post('/update',auth,function(req,res){
    const WIP = req.body.WIP
    const Brand = req.body.Brand
    const Tech = req.body.Tech
    const Department = req.body.D
    var insertsql = `Update BP_DW_WIPNoTech Set Brand = '${Brand}', Tech = '${Tech}',UpdatedDate = GetDate(), D = '${Department}' where WIP = ${WIP}`;
    dbquery.query(insertsql,function(err, result){
        if(err) throw err;
        res.redirect('/sql')
    })
})


    router.post('/createuserfunction',async(req,res)=>{
        const username = req.body.UserName
        const fname = req.body.FirstName
        const lname = req.body.LastName
        const pos = req.body.Position
        const BU = req.body.BU
        const Branch = req.body.Branch
        const pass = req.body.Password

        const hashpass = await bcrypt.hash(pass,10)

        const UserSearch = `select * from BPUsers where UserName = '${username}'`
        const UserInsert = `insert into BPUsers (UserName,FirstName,LastName,Position,BU,Branch,CreatedDate,Passwords) values ('${username}','${fname}','${lname}','${pos}','${BU}','${Branch}',GETDATE(),'${hashpass}')`;


        dbquery.query(UserSearch, async(err, result,recordsets)=>{
            //var Searchdata = JSON.stringify(recordsets)
            //var   JSearchdata = JSON.parse(Searchdata);
            if (err) throw (err)
            if (result.recordsets[0].length != 0){
            console.log("User Already exists")

            }else {
                
                await dbquery.query (UserInsert, (err, result)=> {
                    dbquery.release()
                    if (err) throw (err)
                    console.log ("Created new User")
                   })
            }
            res.redirect('/createuserform') 
    })

})

router.post('/updatewip2tech',auth,function(req,res){
        const WIP = req.body.WIP
        const OriginalTech = req.body.OriginalTech
        const NewTech = req.body.NewTech

        var insertsql = `Update BP_DW_WIP2TECH Set NewTech = '${NewTech}',UpdatedDate = GetDate() where WIP = ${WIP} and OriginalTech = '${OriginalTech}'`;
        dbquery.query(insertsql,async function(err, result){
            if(err) throw err;
            return res.redirect('/wip2tech')
        })
 })
    
router.get("/logout", auth, (req, res) => {
    return res
      .clearCookie("auth")
      .status(200)
      .render('login.ejs',{loginstatus:''});
  });

//   router.post("/uploadfile",auth,upload.single('uploadfile'),(req,res)=>{
//     var branch = req.branch
//     readXlsxFile('./public/upload/'+branch+'/'+req.file.filename).then((rows)=>{
//         console.log(rows)
//         res.send('Uploaded')
//     })
   
//    })

router.get("/previewimport",auth,async (req,res)=>{

    const modalstatus =  req.body.hiddenmodal
    var branch = req.branch
    var sheet1 = []
    var sheet2 =[]
    var sheet3 =[]
    var sheet4 =[]
    var sheet5 =[]
    var sheet6 =[]
    var filename = []
    var qry = []

    const importstatus = await req.cookies.importstatus

    var str = `Select * from BP_Raw_RefFile where Branch = '${branch}' Order by ImportDate desc;`;
    await dbquery.query(str,(err,recordsets)=>{
        var data =  JSON.stringify(recordsets)
        if (err) throw err;
        var    Jdata = JSON.parse(data);
        return res.clearCookie(importstatus).render('preview',{modalstatus:modalstatus,
            sheet1:sheet1,
            sheet2:sheet2,
            sheet3:sheet3,
            sheet4:sheet4,
            sheet5:sheet5,
            sheet6:sheet6,
            filename:filename,
            importstatus:importstatus,
            stampdate:'No Data',
            Jdata : Jdata})
     })
  

//     try{
      
        
        

        // return res.render('preview',{modalstatus:modalstatus,
        // sheet1:sheet1,
        // sheet2:sheet2,
        // sheet3:sheet3,
        // sheet4:sheet4,
        // sheet5:sheet5,
        // sheet6:sheet6,
        // filename:filename,
        // importstatus:importstatus,
        // stampdate:'No Data',
        // Jdata : qry.Jdata})
         
//    }catch(err){
//     console.log(err)
//    }
 
})

router.post("/uploadfile",auth,upload.single('uploadfile'),async (req,res)=>{
    var branch = req.branch
    var filepath = './public/upload/'+branch+'/'+req.file.filename
    const modalstatus = 'openmodal'
    var stampdate = []
    var sheet1 = []
    var sheet2 =[]
    var sheet3 = []
    var sheet4 = []
    var sheet5 = []
    var sheet6 =[]
    var hasNumber = /\d/;
    pad = function(num) { return ('00'+num).slice(-2) };
    //sheet1
    await readXlsxFile(`${filepath}`,{sheet:1}).then((rows)=>{
        
        rows.shift()
        for (var i in rows){
            if(rows[i][16] !=null ){
                rows[i][1] = rows[i][1].getUTCFullYear()         + '-' +
                                pad(rows[i][1].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][1].getUTCDate()); 
                   
                rows[i][16] = rows[i][16].getUTCFullYear()         + '-' +
                                pad(rows[i][16].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][16].getUTCDate()); 
                }
            
            if(hasNumber.test(`${rows[i][21]}`)){
                rows[i][21] = rows[i][21].getUTCFullYear()         + '-' +
                                pad(rows[i][21].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][21].getUTCDate()); 
            }
            if(hasNumber.test(`${rows[i][17]}`)){
                rows[i][17] = rows[i][17].getUTCFullYear()         + '-' +
                                pad(rows[i][17].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][17].getUTCDate()); 
            }
            if(hasNumber.test(`${rows[i][18]}`)){
                rows[i][18] = rows[i][18].getUTCFullYear()         + '-' +
                                pad(rows[i][18].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][18].getUTCDate()); 
            }

            }
        sheet1.push(rows)
        sheet1 = sheet1[0]
       
    });
   
   
    //sheet2+StampDate
    await readXlsxFile(`${filepath}`,{sheet:2}).then((rows2)=>{

        rows2.shift()
        for (var i in rows2){
            if(hasNumber.test(`${rows2[i][15]}`)){
                rows2[i][15] = rows2[i][15].getUTCFullYear()         + '-' +
                                pad(rows2[i][15].getUTCMonth() + 1)  + '-' +
                                pad(rows2[i][15].getUTCDate()); 
            }
            if(hasNumber.test(`${rows2[i][23]}`)){
                rows2[i][23] = rows2[i][23].getUTCFullYear()         + '-' +
                                pad(rows2[i][23].getUTCMonth() + 1)  + '-' +
                                pad(rows2[i][23].getUTCDate()); 
            }
        }
        
        sheet2.push(rows2)
        sheet2 = sheet2[0]
        stampdate.push(sheet2[0][15])
        stampdate = stampdate[0]
    })
    
      //sheet3
    await readXlsxFile(`${filepath}`,{sheet:3}).then((rows3)=>{

        rows3.shift()
        for (var i in rows3){
            if(hasNumber.test(`${rows3[i][2]}`)){
                rows3[i][2] = rows3[i][2].getUTCFullYear()         + '-' +
                                pad(rows3[i][2].getUTCMonth() + 1)  + '-' +
                                pad(rows3[i][2].getUTCDate()); 
            }

        }
        
        sheet3.push(rows3)
        sheet3 = sheet3[0]

    })

    //sheet4
    await readXlsxFile(`${filepath}`,{sheet:4}).then((rows4)=>{

        rows4.shift()
        for (var i in rows4){
            // if(hasNumber.test(`${rows4[i][3]}`)){
            //     rows4[i][3] = rows4[i][3].getUTCFullYear()         + '-' +
            //                     pad(rows4[i][3].getUTCMonth() + 1)  + '-' +
            //                     pad(rows4[i][3].getUTCDate()); 
            // }
            if(hasNumber.test(`${rows4[i][4]}`)){
                rows4[i][4] = rows4[i][4].getUTCFullYear()         + '-' +
                                pad(rows4[i][4].getUTCMonth() + 1)  + '-' +
                                pad(rows4[i][4].getUTCDate()); 
            }
            if(hasNumber.test(`${rows4[i][12]}`)){
                rows4[i][12] = rows4[i][12].getUTCFullYear()         + '-' +
                                pad(rows4[i][12].getUTCMonth() + 1)  + '-' +
                                pad(rows4[i][12].getUTCDate()); 
            }

        }
        
        sheet4.push(rows4)
        sheet4 = sheet4[0]

    })

     //sheet5
    await readXlsxFile(`${filepath}`,{sheet:5}).then((rows5)=>{

        rows5.shift()
        
        sheet5.push(rows5)
        sheet5 = sheet5[0]

    })
     //sheet6
    await readXlsxFile(`${filepath}`,{sheet:6}).then((rows6)=>{

        rows6.shift()
        for (var i in rows6){
            if(hasNumber.test(`${rows6[i][1]}`)){
                rows6[i][1] = rows6[i][1].getUTCFullYear()         + '-' +
                                pad(rows6[i][1].getUTCMonth() + 1)  + '-' +
                                pad(rows6[i][1].getUTCDate()); 
            }

            if(hasNumber.test(`${rows6[i][10]}`)){
                rows6[i][10] = rows6[i][10].getUTCFullYear()         + '-' +
                                pad(rows6[i][10].getUTCMonth() + 1)  + '-' +
                                pad(rows6[i][10].getUTCDate()); 
            }

        }
        sheet6.push(rows6)
        sheet6 = sheet6[0]

    })    


    res.render('previewmodal',
    {modalstatus:modalstatus,
        sheet1:sheet1,
        sheet2:sheet2,
        sheet3:sheet3,
        sheet4:sheet4,
        sheet5:sheet5,
        sheet6:sheet6,
        filename:filepath,
        importstatus:'',
        stampdate:stampdate,
    })


})

///import///
router.post("/importfile",auth, async (req,res)=>{
    uploadedby = req.username
    branch = req.branch
    datadate = req.body.datadate2send
    filepath = req.body.filename
    var hasNumber = /\d/;
    pad = function(num) { return ('00'+num).slice(-2) };
    var sheet1 = []
    var sheet2 = []
    var sheet3 = []
    var sheet4 = []
    var sheet5 = []
    var sheet6 = []
    //sheet1
    await readXlsxFile(`${filepath}`,{sheet:1}).then((rows)=>{
        
        rows.shift()
        for (var i in rows){
            if(rows[i][16] !=null ){
                rows[i][1] = rows[i][1].getUTCFullYear()         + '-' +
                                pad(rows[i][1].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][1].getUTCDate()); 
                   
                rows[i][16] = rows[i][16].getUTCFullYear()         + '-' +
                                pad(rows[i][16].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][16].getUTCDate()); 
                }
            
            if(hasNumber.test(`${rows[i][21]}`)){
                rows[i][21] = rows[i][21].getUTCFullYear()         + '-' +
                                pad(rows[i][21].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][21].getUTCDate()); 
            }
            if(hasNumber.test(`${rows[i][17]}`)){
                rows[i][17] = rows[i][17].getUTCFullYear()         + '-' +
                                pad(rows[i][17].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][17].getUTCDate()); 
            }
            if(hasNumber.test(`${rows[i][18]}`)){
                rows[i][18] = rows[i][18].getUTCFullYear()         + '-' +
                                pad(rows[i][18].getUTCMonth() + 1)  + '-' +
                                pad(rows[i][18].getUTCDate()); 
            }

            }
        sheet1.push(rows)
        sheet1 = sheet1[0]
       
    });
   
   
    //sheet2+StampDate
    await readXlsxFile(`${filepath}`,{sheet:2}).then((rows2)=>{

        rows2.shift()
        for (var i in rows2){
            if(hasNumber.test(`${rows2[i][15]}`)){
                rows2[i][15] = rows2[i][15].getUTCFullYear()         + '-' +
                                pad(rows2[i][15].getUTCMonth() + 1)  + '-' +
                                pad(rows2[i][15].getUTCDate()); 
            }
            if(hasNumber.test(`${rows2[i][23]}`)){
                rows2[i][23] = rows2[i][23].getUTCFullYear()         + '-' +
                                pad(rows2[i][23].getUTCMonth() + 1)  + '-' +
                                pad(rows2[i][23].getUTCDate()); 
            }
        }
        
        sheet2.push(rows2)
        sheet2 = sheet2[0]
    })
    
      //sheet3
    await readXlsxFile(`${filepath}`,{sheet:3}).then((rows3)=>{

        rows3.shift()
        for (var i in rows3){
            if(hasNumber.test(`${rows3[i][2]}`)){
                rows3[i][2] = rows3[i][2].getUTCFullYear()         + '-' +
                                pad(rows3[i][2].getUTCMonth() + 1)  + '-' +
                                pad(rows3[i][2].getUTCDate()); 
            }

        }
        
        sheet3.push(rows3)
        sheet3 = sheet3[0]

    })

    //sheet4
    await readXlsxFile(`${filepath}`,{sheet:4}).then((rows4)=>{

        rows4.shift()
        for (var i in rows4){
            // if(hasNumber.test(`${rows4[i][3]}`)){
            //     rows4[i][3] = rows4[i][3].getUTCFullYear()         + '-' +
            //                     pad(rows4[i][3].getUTCMonth() + 1)  + '-' +
            //                     pad(rows4[i][3].getUTCDate()); 
            // }
            if(hasNumber.test(`${rows4[i][4]}`)){
                rows4[i][4] = rows4[i][4].getUTCFullYear()         + '-' +
                                pad(rows4[i][4].getUTCMonth() + 1)  + '-' +
                                pad(rows4[i][4].getUTCDate()); 
            }
            if(hasNumber.test(`${rows4[i][12]}`)){
                rows4[i][12] = rows4[i][12].getUTCFullYear()         + '-' +
                                pad(rows4[i][12].getUTCMonth() + 1)  + '-' +
                                pad(rows4[i][12].getUTCDate()); 
            }

        }
        
        sheet4.push(rows4)
        sheet4 = sheet4[0]

    })

     //sheet5
    await readXlsxFile(`${filepath}`,{sheet:5}).then((rows5)=>{

        rows5.shift()
        
        sheet5.push(rows5)
        sheet5 = sheet5[0]

    })
     //sheet6
    await readXlsxFile(`${filepath}`,{sheet:6}).then((rows6)=>{

        rows6.shift()
        for (var i in rows6){
            if(hasNumber.test(`${rows6[i][1]}`)){
                rows6[i][1] = rows6[i][1].getUTCFullYear()         + '-' +
                                pad(rows6[i][1].getUTCMonth() + 1)  + '-' +
                                pad(rows6[i][1].getUTCDate()); 
            }

            if(hasNumber.test(`${rows6[i][10]}`)){
                rows6[i][10] = rows6[i][10].getUTCFullYear()         + '-' +
                                pad(rows6[i][10].getUTCMonth() + 1)  + '-' +
                                pad(rows6[i][10].getUTCDate()); 
            }

        }
        sheet6.push(rows6)
        sheet6 = sheet6[0]

    })    
    
    
    async function insertloop(s1,s2,s3,s4,s5,s6) {
        for (var i in s1){
                const string1 = `Insert Into BP_Raw_Data`  
                const string2 = `values('${s1[i][0]}','${s1[i][1]}','','${s1[i][3]}','${s1[i][4]}',`
                const string3 = `'${s1[i][5]}','${s1[i][6]}','${s1[i][7]}','${s1[i][8]}','${s1[i][9]}',`
                const string4 = `'${s1[i][10]}','${s1[i][11]}','${s1[i][12]}','${s1[i][13]}','${s1[i][14]}',`
                const string5 = `'${s1[i][15]}','${s1[i][16]}','${s1[i][17]}','${s1[i][18]}','${s1[i][19]}',`
                const string6 = `'${s1[i][20]}','${s1[i][21]}','${branch}','${uploadedby}','${datadate}',`
                const string7 = `'${filepath}',GETDATE())`; 
                const fullstring = string1+' '+string2+string3+string4+string5+string6+string7
                await dbquery.query(fullstring)
            }
        for (var i in s2){
                const string1 = `Insert Into BP_Raw_Analysis`  
                const string2 = `values('${s2[i][0]}','${s2[i][1]}','${s2[i][2]}','${s2[i][3]}','${s2[i][4]}',`
                const string3 = `'${s2[i][5]}','${s2[i][6]}','${s2[i][7]}','${s2[i][8]}','${s2[i][9]}',`
                const string4 = `'${s2[i][10]}','${s2[i][11]}','${s2[i][12]}','${s2[i][13]}','${s2[i][14]}',`
                const string5 = `'${s2[i][15]}','${s2[i][16]}','${s2[i][17]}','${s2[i][18]}','${s2[i][19]}',`
                const string6 = `'${s2[i][20]}','${s2[i][21]}','${s2[i][22]}','${s2[i][23]}','${s2[i][24]}','','${branch}','${uploadedby}','${datadate}',`
                const string7 = `'${filepath}',GETDATE())`; 
                const fullstring = string1+' '+string2+string3+string4+string5+string6+string7
                await dbquery.query(fullstring)
            }
        for (var i in s3){
                const string1 = `Insert Into BP_Raw_AS`  
                const string2 = `values('${s3[i][0]}','${s3[i][1]}','${s3[i][2]}','${s3[i][3]}','${s3[i][4]}',`
                const string3 = `'${s3[i][5]}','${s3[i][6]}','','${s3[i][8]}','${s3[i][9]}',`
                const string4 = `'${s3[i][10]}','${s3[i][11]}','${s3[i][12]}','${s3[i][13]}','${s3[i][14]}',`
                const string5 = `'${s3[i][15]}','${s3[i][16]}','${s3[i][17]}','${s3[i][18]}','${s3[i][19]}',`
                const string6 = `'${s3[i][20]}','${s3[i][21]}','${s3[i][22]}','${branch}','${uploadedby}','${datadate}',`
                const string7 = `'${filepath}',GETDATE())`; 
                const fullstring = string1+' '+string2+string3+string4+string5+string6+string7
                await dbquery.query(fullstring)
            }
        for (var i in s4){
                const string1 = `Insert Into BP_Raw_CheckIn`  
                const string2 = `values('${s4[i][0]}','${s4[i][1]}','${s4[i][2]}','${s4[i][3]}','${s4[i][4]}',`
                const string3 = `'','${s4[i][6]}','${s4[i][7]}','${s4[i][8]}','${s4[i][9]}',`
                const string4 = `'${s4[i][10]}','${s4[i][11]}','${s4[i][12]}','${s4[i][13]}','${s4[i][14]}',`
                const string5 = `'${s4[i][15]}','${s4[i][16]}','${s4[i][17]}',`
                const string6 = `'${branch}','${uploadedby}','${datadate}',`
                const string7 = `'${filepath}',GETDATE())`; 
                const fullstring = string1+' '+string2+string3+string4+string5+string6+string7
                await dbquery.query(fullstring)
            }
        for (var i in s5){
                const string1 = `Insert Into BP_Raw_CheckOut`  
                const string2 = `values('${s5[i][0]}','${s5[i][1]}','${s5[i][2]}','${s5[i][3]}','',`
                const string3 = `'${s5[i][5]}','${s5[i][6]}','${s5[i][7]}','${s5[i][8]}','${s5[i][9]}',`
                const string4 = `'${s5[i][10]}','${s5[i][11]}',`
                const string5 = `'${branch}','${uploadedby}','${datadate}',`
                const string6 = `'${filepath}',GETDATE())`;
                const fullstring = string1+' '+string2+string3+string4+string5+string6
                await dbquery.query(fullstring)
            }
        for (var i in s6){
                const string1 = `Insert Into BP_Raw_QT`  
                const string2 = `values('${s6[i][0]}','${s6[i][1]}','','${s6[i][3]}','${s6[i][4]}',`
                const string3 = `'${s6[i][5]}','${s6[i][6]}','${s6[i][7]}','${s6[i][8]}','${s6[i][9]}',`
                const string4 = `'${s6[i][10]}','${s6[i][11]}',`

                const string6 = `'${branch}','${uploadedby}','${datadate}',`
                const string7 = `'${filepath}',GETDATE())`; 
                const fullstring = string1+' '+string2+string3+string4+string6+string7
                await dbquery.query(fullstring)
            }
        }
    


    const reffile = `Insert Into BP_Raw_RefFile values('${filepath}','${uploadedby}','${datadate}',GETDATE(),'${branch}')`;
    //delete if error//
    const deletefile = `Delete BP_Raw_RefFile where Filepath = '${filepath}'`
    const deleteOpenorder = `Delete BP_Raw_Data where FileName = '${filepath}'`
    const deleteAnalysis = `Delete BP_Raw_Analysis where FileName = '${filepath}'`
    const deleteAS = `Delete BP_Raw_AS where FileName = '${filepath}'`
    const deleteCheckIn = `Delete BP_Raw_CheckIn where FileName = '${filepath}'`
    const deleteCheckOut = `Delete BP_Raw_CheckOut where FileName = '${filepath}'`
    const deleteCheckQT = `Delete BP_Raw_QT where FileName = '${filepath}'`

    try{

        const result1 = await dbquery.query(reffile)
        const result2 = await insertloop(sheet1,sheet2,sheet3,sheet4,sheet5,sheet6)
        return res.cookie('importstatus','y',{maxAge:1000}).redirect('/previewimport')
    }catch(err){
        const deletefile1 = await dbquery.query(deletefile)
        const delete1 = await dbquery.query(deleteOpenorder)
        const delete2 = await dbquery.query(deleteAnalysis)
        const delete3 = await dbquery.query(deleteAS)
        const delete4 = await dbquery.query(deleteCheckIn)
        const delete5 = await dbquery.query(deleteCheckOut)
        const delete6 = await dbquery.query(deleteCheckQT)
        console.log(err)
        res.cookie('importstatus','n',{maxAge:1000})
        setTimeout(() => {
        return res.redirect('/previewimport')
        }, 2000);
    }




})

module.exports = router