var promptbar = document.getElementById("prompt");
var textbox = document.getElementById("text-box");

function auto_resize() {
	promptbar.style.height = "0px";
	let new_height = Math.min(promptbar.scrollHeight, window.innerHeight / 2);
	promptbar.style.height = new_height + "px";
	textbox.style.height = window.innerHeight * 0.9 - new_height + "px";
}

promptbar.oninput = e => {
	auto_resize();
};

promptbar.onkeydown = e => {
	if (!e.shiftKey && e.code == "Enter") {
		e.preventDefault();
		fetch('/send/text', {method: "POST", body: promptbar.value});
		textbox.innerHTML += '<p style="text-align:right;">' + promptbar.value.replace("\n", "<br>") + "</p><br>";
		promptbar.value = "";
	}
	auto_resize();
};

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

Number.prototype.clamp = function(min, max) {
	return Math.min(Math.max(this, min), max);
};

var dragging_video = false;
var mouse_start_x = 0, mouse_start_y = 0;
var box_start_x = 0, box_start_y = 0;

function video_pos_clamp() {
	let box = video.parentElement.getBoundingClientRect();
	video.parentElement.style.left = box.x.clamp(0, window.innerWidth - box.width) + "px";
	video.parentElement.style.top = box.y.clamp(0, window.innerHeight - box.height) + "px";
	if (box.x >= window.innerWidth - box.width) {
		video.parentElement.style.left = "";
		video.parentElement.style.right = "0px";
	}
}

video.parentElement.onmousedown = e => {
	mouse_start_x = e.clientX;
	mouse_start_y = e.clientY;
	box_start_x = video.parentElement.getBoundingClientRect().x;
	box_start_y = video.parentElement.getBoundingClientRect().y;
	if (e.button == 0) {
		dragging_video = true;
	}
};

document.onmouseup = e => {
	dragging_video = false;
};

document.onmousemove = e => {
	if (dragging_video) {
		video.parentElement.style.right = "";
		video.parentElement.style.left = box_start_x + e.clientX - mouse_start_x + "px";
		video.parentElement.style.top = box_start_y + e.clientY - mouse_start_y + "px";
		video_pos_clamp();
	}
	mousex = e.clientX;
	mousey = e.clientY;
};

window.onload = e => {
	auto_resize();
};

window.onresize = e => {
	auto_resize();
	video_pos_clamp();
};

video.onresize = e => {
	video_pos_clamp();
};

function sendImage() {
	let input = document.createElement('input');
	input.type = 'file';

	input.onchange = e => {
		let formData = new FormData();
		for (let i = 0; i < e.target.files.length; i++) {
			formData.append((Math.random() * 0xFFFFFFFF << 0).toString(16), e.target.files[i]);
			let img = document.createElement("img");
			img.setAttribute('src', URL.createObjectURL(e.target.files[i]));
			textbox.appendChild(img);
			img.style.width = '50%';
			textbox.innerHTML += "<br><br>";
		}

		fetch('/send/image', {method: "POST", body: formData});
	}

	input.click();
}

function generate() {
	fetch("generate").then(async response => {
		const reader = response.body.getReader();

		while (true) {
    			let { value, done } = await reader.read();
			if (done) { break; }
			text = "";
			for (let i = 0; i < value.length; i++) {
				text += String.fromCharCode(value[i]);
			}
			textbox.innerHTML += text.replace("\n", "<br>");
		}

		textbox.innerHTML += "<br><br>";
	});
}
