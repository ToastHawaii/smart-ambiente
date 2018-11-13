#!/usr/bin/liquidsoap -v

set("log.file.path","/tmp/<script>.log")
set("log.stdout",true)

set("harbor.bind_addr","0.0.0.0")

muted = mksafe(blank())

out = output.icecast(%mp3,mount="smart-ambiente/weather")
	
output = ref out(muted)
	
def update_scene(~protocol,~data,~headers,uri) =

	def sources_of_scene(entry) =
		source = ref single(entry["file"])
		
		pan = entry["pan"]
		if pan != "" and pan != "none" then
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
	
	def weights_of_scene(entry) =
		int_of_float(float_of_string(entry["volume"])*100.)
	end

	scene = of_json(default=[[("file",""),("volume",""),("pan",""),("crossfade",""),("random","")]],data)

	source.shutdown(!output)
	if list.length(scene) == 0 then
		output := out(muted)
	else
		output := out(mksafe(add(weights=list.map(weights_of_scene,scene),list.map(sources_of_scene,scene))))
	end
	
    http_response(
		protocol=protocol,
		code=200
	)
end

harbor.http.register(port=8003,method="POST","^/scene/weather",update_scene)
