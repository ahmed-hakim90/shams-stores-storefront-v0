import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mapBankTransfer} from '../lib/payments/bank-transfer.ts'
import ts from 'typescript'
import {readFileSync} from 'node:fs'
import * as jsx from 'react/jsx-runtime'
import {renderToStaticMarkup} from 'react-dom/server'
const details={title:'InstaPay',instructions:'Transfer after placing your order',accounts:[{account_name:'Fixture',account_number:'001234',bank_name:'Test bank',iban:'EG000123',secret:'never'}]}
test('bank transfer mapping preserves leading zeros, only returns public fields and omits empty accounts',()=>{
 const result=mapBankTransfer({...details,accounts:[...details.accounts,{},null]})
 assert.equal(result.accounts.length,1);assert.equal(result.accounts[0].account_number,'001234');assert.equal(result.accounts[0].secret,undefined)
 assert.equal(mapBankTransfer(null),null)
})
test('bank transfer UI supports loading, unavailable, copy success and clipboard failure',async()=>{
 let response={isPending:true},status=''
 const compiled=ts.transpileModule(readFileSync(new URL('../components/shams/payments/bank-transfer-details.tsx',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText
 const m={exports:{}};const deps={'react/jsx-runtime':jsx,react:{useState:()=>[status,v=>{status=v}]},'@tanstack/react-query':{useQuery:()=>response},'@/lib/commerce/browser':{commerceFetch(){}}}
 new Function('require','module','exports',compiled)(n=>deps[n],m,m.exports)
 const tree=()=>m.exports.BankTransferDetails();const html=()=>renderToStaticMarkup(tree())
 assert.match(html(),/Loading transfer/);response={isError:true};assert.match(html(),/unavailable/)
 response={data:mapBankTransfer(details)};assert.match(html(),/001234/);assert.match(html(),/Copy Account number/)
 function buttons(node){if(!node||typeof node!=='object')return[];if(Array.isArray(node))return node.flatMap(buttons);return [...(node.type==='button'?[node]:[]),...buttons(node.props?.children)]}
 let copied;Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async v=>{copied=v}}}})
 await buttons(tree())[0].props.onClick();await new Promise(r=>setImmediate(r));assert.equal(copied,'001234');assert.match(status,/Copied/)
 navigator.clipboard.writeText=async()=>{throw Error('denied')};await buttons(tree())[0].props.onClick();await new Promise(r=>setImmediate(r));assert.match(status,/Select and copy/)
})
