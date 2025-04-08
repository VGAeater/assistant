var video = document.getElementById('video');

function setStream(stream) {
	stream.oninactive = () => { video.srcObject = null; };
	video.srcObject = stream;
}

function useCamera() {
	if (video.srcObject) video.srcObject.getTracks().forEach((t) => { t.stop(); });
	video.srcObject = null;

	var constraints = {
		audio: false,
		video: {
			facingMode: "user" // Can be 'user' or 'environment' to access back or front camera (NEAT!)
		}
	};
	
	navigator.mediaDevices.getUserMedia(constraints).then(setStream);
}

function useScreen() {
	if (video.srcObject) video.srcObject.getTracks().forEach((t) => { t.stop(); });
	video.srcObject = null;

	const constraints = {
		video: {
			displaySurface: "browser",
		},
		audio: {
			suppressLocalAudioPlayback: false,
		},
		preferCurrentTab: false,
		selfBrowserSurface: "exclude",
		systemAudio: "include",
		surfaceSwitching: "include",
		monitorTypeSurfaces: "include",
	};

	return navigator.mediaDevices.getDisplayMedia(constraints).then(setStream);
}
