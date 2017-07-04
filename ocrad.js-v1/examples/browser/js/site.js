console.clear();
angular.module('fileUpload', [])
  //.controller("upload", ['$scope', '$http', 'uploadService', function($scope, $http, uploadService) {
  .controller("upload", ['$scope', '$http', function($scope, $http) {
	$scope.$watch('file', function(newfile, oldfile) {
	  if(angular.equals(newfile, oldfile) ){
		return;
	  }

	  //uploadService.upload(newfile).then(function(res){
		// DO SOMETHING WITH THE RESULT!
		//console.log("result", res);
	  //})
	});

  }])
  //.service("uploadService", function($http, $q) {

	//return ({
	  //upload: upload
	//});

	//function upload(file) {
	  //var upl = $http({
		//method: 'POST',
		//url: 'http://jsonplaceholder.typicode.com/posts', // /api/upload
		//headers: {
		  //'Content-Type': 'multipart/form-data'
		//},
		//data: {
		  //upload: file
		//},
		//transformRequest: function(data, headersGetter) {
		  //var formData = new FormData();
		  //angular.forEach(data, function(value, key) {
			//formData.append(key, value);
		  //});

		  //var headers = headersGetter();
		  //delete headers['Content-Type'];

		  //return formData;
		//}
	  //});
	  //return upl.then(handleSuccess, handleError);

	//} // End upload function

	// ---
	// PRIVATE METHODS.
	// ---
  
	//function handleError(response, data) {
	  //if (!angular.isObject(response.data) ||!response.data.message) {
		//return ($q.reject("An unknown error occurred."));
	  //}

	 // return ($q.reject(response.data.message));
	//}

	//function handleSuccess(response) {
	  //return (response);
	//}

  //})
  .directive("fileinput", [function() {
	return {
	  scope: {
		fileinput: "=",
		filepreview: "="
	  },
	  link: function(scope, element, attributes) {
		element.bind("change", function(changeEvent) {
		  scope.fileinput = changeEvent.target.files[0];

		  createDataURL(scope).then(sucessCallback, errorCallback);
		});
	  }
	}
  }]);
  
  
  createDataURL = function (scope) {

	$injector = angular.injector(['ng']);
	q = $injector.get('$q');
	timeout = $injector.get('$timeout');
	var imageResultEl = angular.element( document.querySelectorAll( '.image-results' ) );

	var deferred = q.defer();
	var reader = new FileReader();
	reader.onload = function (e) {
	
		scope.$apply(function() {
		  scope.filepreview = e.target.result;
		  imageResultEl.removeClass('hidden');
		});
	
		deferred.resolve(e.target.result)
	}
	reader.onerror = function (e) {
		deferred.reject()
	}
	reader.readAsDataURL(scope.fileinput);

	return deferred.promise;
}


window.onload = function(){
	
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	
	var controlsEl = angular.element( document.querySelector( '#controls' ) );
	var videoEl = angular.element( document.querySelector( '#video-container' ) );
	var containerEl = angular.element( document.querySelector( '#image-container' ) );
	var imageResultEl = angular.element( document.querySelectorAll( '.image-results' ) );
    var img = document.getElementById('orig');

    alert(0);
	
	
	if(navigator.getUserMedia) {
	  navigator.getUserMedia({ video: true }, acquiredVideo, function(){})
	   console.log('GetUserMedia is supported', navigator.getUserMedia);

		controlsEl.removeClass('hidden');
		videoEl.removeClass('hidden');
		containerEl.addClass('hidden');
		imageResultEl.removeClass('hidden');
	   
	} else {
		controlsEl.addClass('hidden');
		videoEl.addClass('hidden');
		containerEl.addClass('visible');
	
	   console.log('GetUserMedia not supported: FALL BACK NEEDED', navigator.getUserMedia);
	}
	
	//Filtering
	var canvases = document.getElementsByTagName('canvas');
		for (var i=0; i<canvases.length; i++) {
		var c = canvases[i];
		c.parentNode.insertBefore(img.cloneNode(true), c);
		c.style.display = 'none';
	}
	

	function runFilter(id, filter, arg1, arg2, arg3) {
		
		var c = document.getElementById(id);
		var s = c.previousSibling.style;

		if (s.display == 'none') 
			{
			  s.display = 'inline';
			  //c.style.display = 'none';
			} 
		else 
			{
			  var idata = Filters.filterImage(filter, img, arg1, arg2, arg3);
			  c.width = idata.width;
			  c.height = idata.height;
			  var ctx = c.getContext('2d');
			  ctx.putImageData(idata, 0, 0);
			  s.display = 'none';
			  c.style.display = 'inline';
		}
	}

	grayscale = function(id) {
		runFilter(id, Filters.grayscale);
		//draw_image(id,'grayscale-image');
	}

	brightness = function(id) {
		runFilter(id, Filters.brightness, 50);
	}

	threshold = function(id) {
		runFilter(id, Filters.threshold, 128);
		//draw_image(id,'threshold-image');
	}

	sharpen = function() {
		runFilter('sharpen', Filters.convolute,
		  [ 0, -1,  0,
		   -1,  5, -1,
			0, -1,  0]);
	}

	blurC = function() {
		runFilter('blurC', Filters.convolute,
		  [ 1/9, 1/9, 1/9,
			1/9, 1/9, 1/9,
			1/9, 1/9, 1/9 ]);
	}

	sobel = function() {
		runFilter('sobel', function(px) {
		  px = Filters.grayscale(px);
		  var vertical = Filters.convoluteFloat32(px,
			[-1,-2,-1,
			  0, 0, 0,
			  1, 2, 1]);
		  var horizontal = Filters.convoluteFloat32(px,
			[-1,0,1,
			 -2,0,2,
			 -1,0,1]);
		  var id = Filters.createImageData(vertical.width, vertical.height);
		  for (var i=0; i<id.data.length; i+=4) {
			var v = Math.abs(vertical.data[i]);
			id.data[i] = v;
			var h = Math.abs(horizontal.data[i]);
			id.data[i+1] = h
			id.data[i+2] = (v+h)/4;
			id.data[i+3] = 255;
		  }
		  return id;
		});
	}

	custom = function() {
		var inputs = document.getElementById('customMatrix').getElementsByTagName('input');
		var arr = [];
		for (var i=0; i<inputs.length; i++) {
		  arr.push(parseFloat(inputs[i].value));
		}
		runFilter('custom', Filters.convolute, arr, true);
	}
	
}


recognize_snapshot = function (){
	document.getElementById('text').innerText = "Recognizing..."
	document.getElementById('transcription').className = "recognizing"
	OCRAD(document.getElementById("video"), {
		invert: document.getElementById('whiteText').checked // set this for white on black text
		//invert: true // black text white background
	}, function(text){
		document.getElementById('transcription').className = "done"
		document.getElementById('text').innerText = text || "(empty)";
	})
}

recognize_image = function (id){
	
	document.getElementById('text').innerText = "Recognizing image..."
	
	console.log(document.getElementById(id));
	
	OCRAD(document.getElementById(id), {
		invert: false // black text white background
	}, function(text){
		document.getElementById('transcription').className = "done"
		document.getElementById('text').innerText = text;
	})
}

recognize_canvas = function (id){
	document.getElementById('text').innerText = "Recognizing canvas..."
	
	console.log(document.getElementById(id));
	
	OCRAD(document.getElementById(id), {
		invert: false // black text white background
	}, function(text){
		document.getElementById('transcription').className = "done"
		document.getElementById('text').innerText = text;
	})
}

recognize_newimage = function (id){
	document.getElementById('text').innerText = "Recognizing new image..."
	
	console.log(document.getElementById(id));
	
	OCRAD(document.getElementById(id), {
		invert: false // black text white background
	}, function(text){
		document.getElementById('transcription').className = "done"
		document.getElementById('text').innerText = text;
	})
}

acquiredVideo = function (stream){
	var video = document.getElementById('video')
	if ('mozSrcObject' in video) { video.mozSrcObject = stream;
	} else if (window.webkitURL) { video.src = window.webkitURL.createObjectURL(stream);
	} else { video.src = stream; }
	video.play();

	//document.getElementById('blackText').checked = true;
}

sucessCallback = function () {
  timeout(function () {
	recognize_image('orig');
  }, 300);
}

errorCallback = function () {
  //no error handling as yet
}


draw_image = function(canvasid, imgid) {

      var canvas = document.getElementById(canvasid);
      var context = canvas.getContext('2d');
	 
      // draw cloud
      /*context.beginPath();
      context.moveTo(170, 80);
      context.bezierCurveTo(130, 100, 130, 150, 230, 150);
      context.bezierCurveTo(250, 180, 320, 180, 340, 150);
      context.bezierCurveTo(420, 150, 420, 120, 390, 100);
      context.bezierCurveTo(430, 40, 370, 30, 340, 50);
      context.bezierCurveTo(320, 5, 250, 20, 250, 50);
      context.bezierCurveTo(200, 5, 150, 20, 170, 80);
      context.closePath();
      context.lineWidth = 5;
      context.fillStyle = '#8ED6FF';
      context.fill();
      context.strokeStyle = '#0000ff';
      context.stroke();
	 */
      // save canvas image as data url (png format by default)
	  
      var dataURL = canvas.toDataURL('image/png');
	  


      // set canvasImg image src to dataURL
      // so it can be saved as an image
      document.getElementById(imgid).src = dataURL;
}