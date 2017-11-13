label = Widget.extend({
  initialize: function(obj) { 
	this.device = obj; 
	this.modulelist = null;
},
  getHTML: function() {
	// must be global otherwise it's not visible to the ajax request :(
	var htmlcontent = "";
	var uhwid = this.device.getUniqueHWID();
	var dname = this.device.getDisplayname();

	var url = window.location.href.toString().split(window.location.host)[1];
	url = url.replace("index.html","modules/label/label.html");

	this.id = this.device.getHWID();


	$.ajax({
		url: url,
		type: "GET",
		async: false,
		cache: true,
		dataType: "html",
		success: function(result){
			htmlcontent = result;
			htmlcontent = htmlcontent.replace("dummy_label" , uhwid + "_label");
			htmlcontent = htmlcontent.replace("dummy_value" , uhwid + "_value");
			htmlcontent = htmlcontent.replace("LABEL" , dname );
	    }
	});

	return htmlcontent;
  },
  addDeviceUpdater : function() {

	var read = this.device.getReading();
	var uhwid = this.device.getUniqueHWID();
	var unit = this.device.getUnit();
	var myupd = this.updater;
	var uival = this.device.getUpdateInterval();

	//console.log("adding updater to "+uhwid + " with ival "+uival + " adding " +unit);

   this.updater = new $.PeriodicalUpdater('', {
        url: '/fhem',         // URL of ajax request
        cache: false,     // By default, don't allow caching
        method: 'GET',    // method; get or post
        data: {cmd: 'jsonlist '+this.device.getHWID(), XHR: 1},         // array of values to be passed to the page - e.g. {name: "John", greeting: "hello"}
        minTimeout: uival, // starting value for the timeout in milliseconds
        maxTimeout:90000, // maximum length of time between requests
        multiplier: 2,    // if set to 2, timerInterval will double each time the response hasn't changed (up to maxTimeout)
        maxCalls: 0,      // maximum number of calls. 0 = no limit.
        maxCallsCallback: null, // The callback to execute when we reach our max number of calls
        autoStop: 0,      // automatically stop requests after this many returns of the same data. 0 = disabled
        autoStopCallback: null, // The callback to execute when we autoStop
        cookie: false,    // whether (and how) to store a cookie
        runatonce: true, // Whether to fire initially or wait
        verbose: 0        // The level to be logging at: 0 = none; 1 = some; 2 = all
    }, function(remoteData, success, xhr, handle) {
        // Process the new data (only called when there was a change)
                // For a description of "success", see $.ajax documentation

               if (remoteData.search("No device named") == -1 ) {
                        var json = jQuery.parseJSON( remoteData );
                        $("#"+uhwid +"_value").html(json.ResultSet.Results.READINGS[reading]['VAL'] + " " +unit );

//		if (remoteData.totalResultsReturned > 0 ) {
//			var json = jQuery.parseJSON( remoteData );
//			$("#"+uhwid +"_value").html(json.Results[0].Readings[read]['Value'] + " " +unit );
		} else {
			alert("fhem doesn NOT know about this device :( \n\n"+remoteData.Arg);
		}
    }
);

  },
  stopDeviceUpdater : function() {
	//console.log("stopping device updater for " + this.device.getUniqueHWID() );
  	if (this.updater != null) this.updater.stop();
  },
  startDeviceUpdater : function() {
	//console.log("starting device updater for " + this.device.getUniqueHWID() );
	if (this.updater != null) {
		//this.updater.send();

		this.updater.restart();

	}
  },
  addClickListener : function() { 
	// this label doesn't need one I guess... in case it does - go ahead 
	console.log("added onClick listener to label");
  },
  onClick : function() { 
	console.log("clicked label...");
  },
  removeClickListener : function() { 
  }


});


