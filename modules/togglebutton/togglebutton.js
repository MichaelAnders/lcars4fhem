togglebutton = Widget.extend({
  initialize: function(obj) {
	this.device = obj;
},
  getHTML: function() {
	//console.log("retrieving togglebtn html");
	// must be global otherwise it's not visible to the ajax request :(
	var htmlcontent = "";

	var uhwid = this.device.getUniqueHWID();
	var hwid = this.device.getHWID();
	var dname = this.device.getDisplayname();

	var myurl = window.location.href.toString().split(window.location.host)[1];
	myurl = myurl.replace("index.html","modules/togglebutton/togglebutton.html");

	/*
     * this part is responsible for retrieving the html of that widget itself
     */

	$.ajax({
		url: myurl,
		type: "GET",
		async: false,
		cache: true,
		dataType: "html",
		success: function(result){
			htmlcontent = result;
			htmlcontent = htmlcontent.replace("dummy_label" , uhwid +"_label");
			htmlcontent = htmlcontent.replace("dummy_value" , uhwid +"_value");
                        htmlcontent = htmlcontent.replace("dummy_toggle" , uhwid +"_toggle");
			//htmlcontent = htmlcontent.replace("filledbyscript","setToggleButton_Toggle(\'"+hwid+"\','"+uhwid +"_value');");
			htmlcontent = htmlcontent.replace("LABEL" , dname );
			htmlcontent = htmlcontent.replace("togglebtnid" , uhwid+"_togglebtnid" );
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
	//console.log("##################adding updater to "+this.device.getHWID() );

    this.updater = $.PeriodicalUpdater('', {
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

   			if (json.ResultSet.Results.STATE=='off') {
				initialhwvalue='AUS';
                                // Change the icon if required
                                if ( $("#"+uhwid +"_toggle")[0].className == "togglebtn_right_on") {
                                        $("#"+uhwid +"_toggle").toggleClass("togglebtn_right_on togglebtn_right_off");
                                }
			}
			else if (json.ResultSet.Results.STATE=='on') {
				initialhwvalue='AN';
				// Change the icon if required
				if ( $("#"+uhwid +"_toggle")[0].className == "togglebtn_right_off") {
					$("#"+uhwid +"_toggle").toggleClass("togglebtn_right_on togglebtn_right_off");
				}
			} else {
				alert("togglebutton not supported for type of \n\n"+json.ResultSet.Results.NAME);
				initialhwvalue='AUS';
				return;
			}

			$("#"+uhwid +"_value").html( initialhwvalue );
		} else {
			alert("fhem doesn NOT know about this device :( \n\n"+remoteData);
		}
    });

  },
  stopDeviceUpdater : function() {
	console.log("stopping device updater for " + this.device.getHWID());
  	if (this.updater != null) this.updater.stop(); else console.log("unable to stop");
  },
  startDeviceUpdater : function() {
	console.log("starting device updater for " + this.device.getHWID());
	if (this.updater != null) {
		//this.updater.send();
		this.updater.restart();
	}
 	else console.log("unable to start");
  },
  addClickListener : function() {

	// this is a bit crappy - we can't access the class itself within the toggle function :(
	var tmptogglefunc = this.onClick;
	var tmpdevhwid = this.device.getUniqueHWID();
	var tmpread = this.device.getReading();
	document.getElementById( this.device.getUniqueHWID()+"_togglebtnid").addEventListener('click', function() {tmptogglefunc(tmpdevhwid,tmpread); }, false);
  },
  onClick : function(uhwid,reading) {
	var state=null;
	var tmpread = reading;
	var initialhwvalue;
	var device_hwid = uhwid.substr(0, uhwid.lastIndexOf("_")); // hack to get the real device HW ID
	console.log("clicked - " + device_hwid);

	var state = "";
	// first of all get current state
	$.ajax({
		url: '/fhem',
		type: "GET",
		async: false,
		cache: false,
		data: {cmd: 'jsonlist '+device_hwid, XHR: 1},
		dataType: "json",
		success: function(remoteData, success, xhr, handle){
       			try
       			{
                        	if (remoteData.ResultSet.Results.STATE=='off') {
	                                state='on';
					initialhwvalue='AN';
	                        }
	                        else if (remoteData.ResultSet.Results.STATE=='on') {
	                                state='off';
					initialhwvalue='AUS';
	                        } else	{
        	                        alert("togglebutton not supported for type of \n\n"+remoteData.ResultSet.Results.NAME);
	                                return;
				}
			}

			catch(err)
       			{
            			console.log("error");
				return;
      			}
		}

	});

	// set FHEM
	if (state != "") {
		$.ajax({
			url: '/fhem',
			type: "GET",
			async: false,//true,
			cache: false,
			data: {cmd: 'set '+device_hwid+' '+state, XHR: 1},
			dataType: "json",
			success: function(result){
				console.log("do something");
		    	}
	        });

		// update the value in the browser
		if (initialhwvalue != "") {
			$("#"+uhwid +"_value").html( initialhwvalue );
			$("#"+uhwid +"_toggle").toggleClass("togglebtn_right_on togglebtn_right_off");
		}
	}
  },
  removeClickListener : function() {
  }

});
