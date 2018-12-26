#!/usr/bin/liquidsoap -v

set("log.file.path","/tmp/<script>.log")
set("log.stdout",true)

set("harbor.bind_addr","0.0.0.0")

muted = blank()

channel = ref muted

instance = argv(default="0",1)

if instance == "0" then
	output.icecast(%mp3,mount="smart-ambiente/channel",mksafe(source.dynamic(fun ()->[!channel])))
else 
	output.icecast(%mp3,mount="smart-ambiente/channel/part/"^instance,mksafe(source.dynamic(fun ()->[!channel])))
end	

def update_scene(~protocol,~data,~headers,uri) =
	
	def sources_of_scene(entry) =
		source = ref muted

	    if entry["typ"] == "file" then
			source := single(entry["source"])
		else
			source := input.http(entry["source"])
		end
		
		source := amplify(float_of_string(entry["volume"]),!source)
		
		pan = entry["pan"]
		if pan != "" then
			if pan == "random" then
			    source := stereo.pan(pan=fun()->random.float(min=-1.,max=1.),!source)
			else
			    source := stereo.pan(pan=float_of_string(pan),!source)
			end		   
		end

		crossfade_duration = float_of_string(entry["crossfade"])
		if crossfade_duration > 0. then
          source := crossfade(start_next=crossfade_duration,fade_in=crossfade_duration,fade_out=crossfade_duration,!source)
		end
		
		rand = int_of_string(entry["random"])
		if rand > 0 then
          source := random(weights=[rand-1,1],[blank(duration=1.),!source])
		end

		!source
	end
	
	scene = of_json(default=[[("typ",""),("source",""),("volume",""),("pan",""),("crossfade",""),("random","")]],data)

	if list.length(scene) == 0 then
		channel := muted
	else
		channel := add(normalize=false,list.map(sources_of_scene,scene))
	end
	
    http_response(
		protocol=protocol,
		code=200
	)
end

harbor.http.register(port=int_of_string("800"^instance)+1,method="POST","^/smart-ambiente/scene",update_scene)
