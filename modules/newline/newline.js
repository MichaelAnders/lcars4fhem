newline = Widget.extend({
  initialize: function(obj) { 
	this.device = obj; 
	this.id = this.device.getHWID();
  },
  getHTML: function() {
	// must be global otherwise it's not visible to the ajax request :(
	var htmlcontent = "";

	var url = window.location.href.toString().split(window.location.host)[1];
	url = url.replace("index.html","modules/newline/newline.html");
	
	$.ajax({
		url: url,
		type: "GET",
		async: false,
		cache: true,	
		dataType: "html",	
		success: function(result){
			htmlcontent = result;			
	    }
	});

	return htmlcontent;
  },
  addDeviceUpdater : function() {
	// not needed
  },
  stopDeviceUpdater : function() {
	// not needed
  },
  startDeviceUpdater : function() {
	// not needed
  }

});
