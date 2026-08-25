import { createClient } from 'npm:@supabase/supabase-js@2.95.0'

type Listing = {
  id: number
  name: string
  listing_type: string
  state_id: number | null
  district_id: number | null
  states?: { name?: string } | { name?: string }[] | null
  districts?: { name?: string } | { name?: string }[] | null
}

type Scope = {
  user_id: string
  state_id: number | null
  district_id: number | null
  listing_type: string | null
  can_review: boolean
  is_active: boolean
}

const labels: Record<string,string> = {
  annadhanam: 'Annadhanam', jeeva_samadhi: 'Jeeva Samadhi', temple: 'Temples & Meditation Centres',
  stay: 'Affordable Stays', medical: 'Affordable Healthcare', education: 'Affordable Education',
  community_service: 'Volunteer & Community Service',
}

function relationName(value: {name?:string}|{name?:string}[]|null|undefined) {
  return Array.isArray(value) ? value[0]?.name || '' : value?.name || ''
}
function escapeHtml(value:string) {
  return value.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c] || c))
}
function validSecretKeys() {
  const keys:string[]=[]
  const current=Deno.env.get('SUPABASE_SECRET_KEYS')
  if(current){try{keys.push(...Object.values(JSON.parse(current) as Record<string,string>).filter(Boolean))}catch(error){console.error(error)}}
  const legacy=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); if(legacy) keys.push(legacy)
  return [...new Set(keys)]
}
function scopeMatches(scope:Scope, listing:Listing) {
  return scope.is_active && scope.can_review &&
    (scope.state_id===null || scope.state_id===listing.state_id) &&
    (scope.district_id===null || scope.district_id===listing.district_id) &&
    (scope.listing_type===null || scope.listing_type===listing.listing_type)
}

async function deliveryState(db:ReturnType<typeof createClient>, listingId:number, userId:string, channel:'email'|'whatsapp') {
  const {data}=await db.from('admin_notification_deliveries').select('status,attempt_count').eq('listing_id',listingId).eq('admin_user_id',userId).eq('channel',channel).maybeSingle()
  return {sent:data?.status==='sent', attempts:Number(data?.attempt_count||0)}
}
async function logDelivery(db:ReturnType<typeof createClient>, row:Record<string,unknown>) {
  const {error}=await db.from('admin_notification_deliveries').upsert({...row,updated_at:new Date().toISOString()},{onConflict:'listing_id,admin_user_id,channel'})
  if(error) console.error('Delivery log error',error)
}

async function emailAlert(db:ReturnType<typeof createClient>, listing:Listing, userId:string, recipient:string|null) {
  const previous=await deliveryState(db,listing.id,userId,'email'); if(previous.sent) return 'already_sent'
  if(!recipient){await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'email',recipient:null,status:'skipped',provider:'resend',error_message:'No notification email is available.',attempt_count:previous.attempts});return 'skipped'}
  const apiKey=Deno.env.get('RESEND_API_KEY'), from=Deno.env.get('NOTIFICATION_FROM_EMAIL')
  if(!apiKey||!from){await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'email',recipient,status:'pending_configuration',provider:'resend',error_message:'Email provider is not configured.',attempt_count:previous.attempts});return 'pending_configuration'}
  const category=labels[listing.listing_type]||listing.listing_type
  const html=`<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:640px;margin:auto"><h2 style="color:#047857">New listing pending approval</h2><p>A new listing matches your Vallalar Jeevakarunyam admin scope.</p><table style="border-collapse:collapse;width:100%;margin:18px 0"><tr><td><strong>Name</strong></td><td>${escapeHtml(listing.name)}</td></tr><tr><td><strong>Category</strong></td><td>${escapeHtml(category)}</td></tr><tr><td><strong>State</strong></td><td>${escapeHtml(relationName(listing.states)||'Not specified')}</td></tr><tr><td><strong>District</strong></td><td>${escapeHtml(relationName(listing.districts)||'Not specified')}</td></tr></table><p><a href="https://vallalarjeevakarunyam-v2.vercel.app/admin" style="display:inline-block;background:#047857;color:white;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Review in Admin Dashboard</a></p></div>`
  const attemptedAt=new Date().toISOString()
  try{
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({from,to:[recipient],subject:`New listing pending approval: ${listing.name}`,html})})
    const payload=await response.json().catch(()=>({})) as {id?:string;message?:string;error?:string}
    if(!response.ok) throw new Error(payload.message||payload.error||`Resend HTTP ${response.status}`)
    await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'email',recipient,status:'sent',provider:'resend',provider_message_id:payload.id||null,error_message:null,attempt_count:previous.attempts+1,last_attempt_at:attemptedAt});return 'sent'
  }catch(error){await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'email',recipient,status:'failed',provider:'resend',error_message:error instanceof Error?error.message:String(error),attempt_count:previous.attempts+1,last_attempt_at:attemptedAt});return 'failed'}
}

async function whatsappAlert(db:ReturnType<typeof createClient>, listing:Listing, userId:string, recipient:string|null) {
  const previous=await deliveryState(db,listing.id,userId,'whatsapp'); if(previous.sent) return 'already_sent'
  if(!recipient){await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'whatsapp',recipient:null,status:'skipped',provider:'meta_whatsapp',error_message:'No WhatsApp number is configured.',attempt_count:previous.attempts});return 'skipped'}
  const token=Deno.env.get('WHATSAPP_ACCESS_TOKEN'), phoneId=Deno.env.get('WHATSAPP_PHONE_NUMBER_ID'), template=Deno.env.get('WHATSAPP_TEMPLATE_NAME'), version=Deno.env.get('WHATSAPP_GRAPH_VERSION'), language=Deno.env.get('WHATSAPP_TEMPLATE_LANGUAGE')||'en'
  if(!token||!phoneId||!template||!version){await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'whatsapp',recipient,status:'pending_configuration',provider:'meta_whatsapp',error_message:'WhatsApp Cloud API is not configured.',attempt_count:previous.attempts});return 'pending_configuration'}
  const attemptedAt=new Date().toISOString()
  try{
    const response=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({messaging_product:'whatsapp',to:recipient.replace(/\D/g,''),type:'template',template:{name:template,language:{code:language}}})})
    const payload=await response.json().catch(()=>({})) as {messages?:{id?:string}[];error?:{message?:string}}
    if(!response.ok) throw new Error(payload.error?.message||`WhatsApp HTTP ${response.status}`)
    await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'whatsapp',recipient,status:'sent',provider:'meta_whatsapp',provider_message_id:payload.messages?.[0]?.id||null,error_message:null,attempt_count:previous.attempts+1,last_attempt_at:attemptedAt});return 'sent'
  }catch(error){await logDelivery(db,{listing_id:listing.id,admin_user_id:userId,channel:'whatsapp',recipient,status:'failed',provider:'meta_whatsapp',error_message:error instanceof Error?error.message:String(error),attempt_count:previous.attempts+1,last_attempt_at:attemptedAt});return 'failed'}
}

Deno.serve(async(req:Request)=>{
  if(req.method!=='POST') return Response.json({error:'Method not allowed'},{status:405})
  const key=req.headers.get('apikey')||''; if(!key||!validSecretKeys().includes(key)) return Response.json({error:'Unauthorized'},{status:401})
  const url=Deno.env.get('SUPABASE_URL')||''; if(!url) return Response.json({error:'Supabase URL missing'},{status:500})
  const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}})
  const body=await req.json().catch(()=>({})) as {listing_id?:number}; const listingId=Number(body.listing_id); if(!Number.isInteger(listingId)) return Response.json({error:'Valid listing_id required'},{status:400})
  const {data:listing,error:listingError}=await db.from('listings').select('id,name,listing_type,state_id,district_id,states(name),districts(name)').eq('id',listingId).eq('status','pending').maybeSingle()
  if(listingError) return Response.json({error:listingError.message},{status:500}); if(!listing) return Response.json({ok:true,skipped:'not_pending'})
  const [{data:admins},{data:scopes},{data:prefs}]=await Promise.all([
    db.from('admins').select('user_id,role'),
    db.from('admin_scopes').select('user_id,state_id,district_id,listing_type,can_review,is_active').eq('is_active',true),
    db.from('admin_notification_preferences').select('user_id,notify_pending_listings,email_enabled,notification_email,whatsapp_enabled,whatsapp_number'),
  ])
  const scopeRows=(scopes||[]) as Scope[]
  const prefMap=new Map((prefs||[]).map((p:any)=>[p.user_id,p]))
  const matched=(admins||[]).filter((a:any)=>a.role==='super_admin'||scopeRows.some(s=>s.user_id===a.user_id&&scopeMatches(s,listing as Listing)))
  const results=[]
  for(const admin of matched as any[]){
    const pref:any=prefMap.get(admin.user_id); if(pref?.notify_pending_listings===false){results.push({user_id:admin.user_id,skipped:'disabled'});continue}
    const {data:userData}=await db.auth.admin.getUserById(admin.user_id)
    const email=pref?.notification_email?.trim()||userData?.user?.email||null
    const row:any={user_id:admin.user_id}
    if(pref?.email_enabled??true) row.email=await emailAlert(db,listing as Listing,admin.user_id,email)
    if(pref?.whatsapp_enabled??false) row.whatsapp=await whatsappAlert(db,listing as Listing,admin.user_id,pref?.whatsapp_number?.trim()||null)
    results.push(row)
  }
  return Response.json({ok:true,listing_id:listingId,matched_admins:matched.length,results})
})
