var express=require('express')
var bodyParser=require('body-parser')
var request=require('request')


const APP_TOKEN="EAAKStZBWJJR8BANszZBqpXieYZAQmZBPqslx7dCCMV2kFZAPKlq2LmakOIZBd8tYYFwZCKCeykvkxtfUlVwqWjE2qBRYrhEK5l3BGhELGLBmEm43UqnWmmffE6gfZBqUWaTsEUibNe9EeESPQaJEZCysfDn8RI6dQWZAxhxMf2CGZBvswZDZD"
var app=express();
app.use(bodyParser.json());

app.listen(3000,function(){
	console.log("El servidor se encuentra en el puerto 3000");
});

app.get('/',function(req,res){
	res.send("Bienvenido al taller");
})
app.get('/webhook',function(req,res){
	if(req.query['hub.verify_token']==='tes_token_say_hello'){
		res.send(req.query['hub.challenge']);
	}else{
		res.send("Tu no tienes que entrar aqui");
	}
})

app.post('/webhook',function(req,res){
	var data=req.body;
	if(data.object=='page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){
					receiveMessage(messagingEvent)
				}
			})
		})
		res.sendStatus(200) 
	}
})

function receiveMessage(event){
	var senderID=event.sender.id
	var messageText=event.message.text
	console.log(senderID)
	console.log(messageText)
	evaluateMessage(senderID,messageText)
}
function evaluateMessage(recipientId,message){
	var finalMessage=""
	if(isContain(message,'ayuda')){
		finalMessage="Ahora mismo no puedo ayudarte"
	}else if(isContain(message,'gato')){
		sendMessageImage(recipientId)

	}else if(isContain(message,'gato')){
		

	}else if(isContain(message,'info')){
		sendMessageTemplate(recipientId)

	}else if(isContain(message,'clima')){
		getWeather(function(temperature){
			message=getMessageWeather(temperature)
			sendMessageText(recipientId,message)
	})

	}else{
		finalMessage="solo se repetir las cosas: "+ message
	}
	sendMessageText(recipientId,finalMessage)
}

function sendMessageText(recipientId,message){
	var messageData={
		recipient:{
			id: recipientId
		},
		message:{
			text:message
		}
	}
	callSendAPI(messageData)
}function sendMessageImage(recipientId){

	var messageData={
		recipient:{
			id: recipientId
		},
		message:{
			attachment:{
				type:"image",
				payload:{
					url:"http://i2.mirror.co.uk/incoming/article5383592.ece/ALTERNATES/s615b/FC-Barcelona-v-Real-Madrid-CF-La-Liga.jpg"
				}
			}
		}
	}
	callSendAPI(messageData)
}
function getWeather(callback){
	

	request('http://api.geonames.org/findNearByWeatherJSON?lat=28.09246&lng=-15.44867&username=diegoroga1',
		function(error,response,data){
			if(!error){
				var response=JSON.parse(data)
				var temperature=response.weatherObservation.temperature
				callback(temperature)
			}
		})
	

}
function getMessageWeather(temperature){
	if(temperature>30){
		return "Nos encontramos a " +temperature +" ten cuidado"
	}else{
		return "Esta haciendo buen tiempo"
	}
}
function sendMessageTemplate(recipientId){
	var messageData={
		recipient:{
			id: recipientId
		},
		message:{
			attachment:{
				type:"template",
				payload:{
					template_type:"generic",
					elements:[ elementTemplate()]
				}
			}
		}
	}
	callSendAPI(messageData)
}

function elementTemplate(){
	return{
		title:"Diego Rodriguez Garcia",
		subtitle:"Reparacion de Moviles",
		item_url:"https://www.facebook.com/canaryrepair/?fref=ts",
		image_url:"http://i2.mirror.co.uk/incoming/article5383592.ece/ALTERNATES/s615b/FC-Barcelona-v-Real-Madrid-CF-La-Liga.jpg",
		buttons:[buttonTemplate()],
	}

}

function buttonTemplate(){
	return{
		type:"web_url",
		url:"https://www.facebook.com/canaryrepair/?fref=ts",
		title:"DRG"
	}
}
function callSendAPI(messageData){
	request({
		uri:'https://graph.facebook.com/v2.6/me/messages',
		qs:{
			access_token:APP_TOKEN
		},
		method:'POST',
		json: messageData
	},function(error,response,data){
		if(error){
			console.log("No es posible enviar el mensaje")
		}else{
			console.log("El mensaje fue enviado")
		}
	})
}
function isContain(sentence,word){
	return sentence.indexOf(word)>-1;
}