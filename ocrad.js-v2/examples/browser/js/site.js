function recognize_snapshot(){
	document.getElementById('text').innerText = "Recognizing..."
	document.getElementById('transcription').className = "recognizing"
	OCRAD(document.getElementById("video"), {
		//invert: document.getElementById('whiteText').checked // set this for white on black text
		invert: true // black text white background
	}, function(text){
		document.getElementById('transcription').className = "done"
		document.getElementById('text').innerText = text || "(empty)";
	})
}

function recognize_image(id){
	document.getElementById('text').innerText = "Recognizing..."
	OCRAD(document.getElementById(id), {
		invert: false // black text white background
	}, function(text){
		document.getElementById('transcription').className = "done"
		document.getElementById('text').innerText = text;
	})
}

function recognize_canvas(id){
	document.getElementById('text').innerText = "Recognizing..."
	OCRAD(document.getElementById(id), {
		invert: false // black text white background
	}, function(text){
		document.getElementById('transcription').className = "done"
		document.getElementById('text').innerText = text;
	})
}


function acquiredVideo(stream){
	
	var video = document.getElementById('video')
	if ('mozSrcObject' in video) { video.mozSrcObject = stream;
	} else if (window.webkitURL) { video.src = window.webkitURL.createObjectURL(stream);
	} else { video.src = stream; }
    video.play();
  
	
}
window.onload = function(){
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
	
	var controlsEl = angular.element( document.querySelector( '#controls' ) );
	var videoEl = angular.element( document.querySelector( '#video-container' ) );
	var containerEl = angular.element( document.querySelector( '#image-container' ) );
	var imageResultEl = angular.element( document.querySelectorAll( '.image-results' ) );
	var constraints = true;
	
	if(navigator.getUserMedia) {
		
	  navigator.getUserMedia({ video: true }, acquiredVideo, function(){})
	   console.log('GetUserMedia is supported', navigator.getUserMedia);

	    imageResultEl.removeClass('hidden');
		controlsEl.removeClass('hidden');
		videoEl.removeClass('hidden');
		containerEl.addClass('hidden');
	   
	} else {
		controlsEl.addClass('hidden');
		videoEl.addClass('hidden');
		containerEl.addClass('visible');
	
	   console.log('GetUserMedia not supported: FALL BACK NEEDED', navigator.getUserMedia);
	}
		
	
}


console.clear();
angular.module('fileUpload', [])
  .controller("upload", ['$scope', '$http', function($scope, $http) {
	$scope.$watch('file', function(newfile, oldfile) {
	  if(angular.equals(newfile, oldfile) ){
		return;
	  }
	});

  }])
 
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
		  filterImage(scope.filepreview);
		  
		});
	
		deferred.resolve(e.target.result)
	}
	reader.onerror = function (e) {
		deferred.reject()
	}
	
	reader.readAsDataURL(scope.fileinput);
	

	return deferred.promise;
}

sucessCallback = function () {
  timeout(function () {
	//recognize_image('pic');
  }, 300);
}


filterImage = function (preview) {
  timeout(function () {
	  
   var img = document.getElementById("my-image");
   img.src = preview;
   //RotateImageRight('my-image');
   //alert(0);

	Caman('#my-image', function () {
	 this.brightness(10);
	 this.contrast(15);
	 //this.sepia(30);
	 //this.saturation(-30);
	 this.render();
	});
	
  }, 1000);
}

//RotateImageRight = function (id) {
	//var img;
	//img = document.getElementById(id);
	//img.style.transform = "rotate(90deg)";
//}

errorCallback = function () {
  //no error handling as yet
}