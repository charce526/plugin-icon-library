const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Database } = require('@nocobase/database');
const { ACL } = require('@nocobase/acl');
const Plugin = require('../dist/server').default;
const definition = { viewBox: '0 0 24 24', attrs: {fill:'currentColor'}, nodes:[{tag:'path',attrs:{d:'M0 0 L24 24'}}] };
const row = {name:'XzCustom12345678Outlined',label:'企业标识',keywords:'企业 品牌',definition};
const directory = fs.mkdtempSync(path.join(os.tmpdir(),'icon-library-test-'));
const storage = path.join(directory,'icons.sqlite');
const maria = process.env.ICON_TEST_MARIADB;
const testPrefix = `icon_test_${process.pid}_${Date.now()}_`;
if (maria) require('dotenv').config({path:path.resolve(__dirname,'../../../../../.env')});
const memory = process.env.ICON_TEST_PG_MEMORY ? require('pg-mem').newDb() : undefined;
if (memory) memory.public.registerFunction({name:'version',returns:'text',implementation:()=> 'PostgreSQL 14.0'});
let db;
async function setup(){
  db=new Database(maria ? {dialect:'mariadb',host:process.env.DB_HOST,port:Number(process.env.DB_PORT),database:process.env.DB_DATABASE,
    username:process.env.DB_USER,password:process.env.DB_PASSWORD,underscored:true,tablePrefix:testPrefix,logging:false}
    : memory ? {dialect:'postgres',dialectModule:memory.adapters.createPg(),logging:false} : {dialect:'sqlite',storage,logging:false});
  if (memory) {
    const originalImport=db.import.bind(db);
    db.import=async(options)=>{await originalImport(options);const model=db.getCollection('xzIconLibraryIcons').model;
      db.getCollection('xzIconLibraryIcons').sync=()=>require('sequelize').Model.sync.call(model);};
  }
  const acl=new ACL(); let actions;
  await new Plugin({db,acl,resourceManager:{define(resource){actions=resource.actions;}}},{name:'icon-test'}).load();
  assert(await db.sequelize.getQueryInterface().tableExists(db.getCollection('xzIconLibraryIcons').model.getTableName()), 'Plugin load creates its missing table');
  return {acl,actions};
}
async function invoke(action,values){
  const ctx={db,action:{params:{values}},throw(status,message){throw Object.assign(new Error(message),{status});}};
  await action(ctx,async()=>{}); return ctx.body;
}
async function main(){
  let {acl,actions}=await setup();
  assert(!await acl.allowManager.isAllowed('iconLibrary','list',{state:{}}));
  assert(await acl.allowManager.isAllowed('iconLibrary','list',{state:{currentUser:{id:1}}}));
  assert(!await acl.allowManager.isAllowed('iconLibrary','import',{state:{currentUser:{id:1}}}));
  acl.define({role:'reader',actions:{}});
  acl.define({role:'manager',actions:{'iconLibrary:import':{}}});
  assert.equal(acl.can({roles:['reader'],resource:'iconLibrary',action:'import'}),null);
  assert(acl.can({roles:['manager'],resource:'iconLibrary',action:'import'}));
  assert.equal(acl.can({roles:['reader'],resource:'xzIconLibraryIcons',action:'create'}),null);
  await invoke(actions.import,row);
  assert.equal((await invoke(actions.list))[0].get('label'),'企业标识');
  await assert.rejects(()=>invoke(actions.import,row),error=>error.status===409);
  for(const attrs of [{onload:'alert(1)'},{fill:'url(https://example.com)'},{href:'https://example.com'},{style:'display:none'}]){
    await assert.rejects(()=>invoke(actions.import,{...row,name:'XzCustom87654321Outlined',definition:{...definition,nodes:[{tag:'path',attrs}]}}),error=>error.status===400);
  }
  for(const tag of ['script','image','foreignObject','use','style']){
    await assert.rejects(()=>invoke(actions.import,{...row,name:'XzCustom87654321Outlined',definition:{...definition,nodes:[{tag,attrs:{}}]}}),error=>error.status===400);
  }
  await assert.rejects(()=>invoke(actions.import,{...row,name:'AppstoreOutlined'}),error=>error.status===400);
  await db.close(); db=undefined;
  ({actions}=await setup());
  assert.equal((await invoke(actions.list))[0].get('name'),row.name);
  assert.equal(await db.getRepository('xzIconLibraryIcons').count(),1);
  console.log(`PASS: NocoBase repository + ${maria ? 'MariaDB' : memory ? 'pg-mem' : 'SQLite'} missing-table creation, reconnect, ACL grants, duplicate handling, metadata and SVG rejection`);
}
main().catch(error=>{console.error(error.message, error.parent?.message);process.exitCode=1;}).finally(async()=>{
  if(db) {
    if(maria) for(const table of [testPrefix+'xz_icon_library_icons',testPrefix+'migrations']) {
      assert(table.startsWith(testPrefix));
      if(await db.sequelize.getQueryInterface().tableExists(table)) await db.sequelize.getQueryInterface().dropTable(table);
    }
    await db.close();
  }
  for(const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory,file));
  fs.rmdirSync(directory);
});
