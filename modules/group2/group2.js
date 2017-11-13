mygroup2 = Widget.extend({
  modulelist: null,
  initialize: function(obj) { 
	this.device = obj; 
	this.id = this.device.id;
	this.modulelist = new Array();
  },
  getHTML: function() {

	url = window.location.href.toString().split(window.location.host)[1];
	url = url.replace("index.html","modules/group2/group2.html");

	// this must be done "dirty" otherwise the ajax request doesn't know about that variable :(
	var rethtmlcontent = "";
	var tmpglobaldevid = this.device.id;
	var tmpglobalcpt = this.device.caption;
	var groupid = this.id;	

	// initially cache this content at first call in order to reduce server requests
	
	$.ajax({
		url: url,
		type: "GET",
		async: false,
		cache: true,	
		dataType: "html",	
		success: function(result){
			rethtmlcontent = result;			
			rethtmlcontent = rethtmlcontent.replace("dummycaption",tmpglobalcpt);
			rethtmlcontent = rethtmlcontent.replace("grp2contentid",tmpglobaldevid+"_tablegrp2content");		
	    }
	});
	
	$("#content").append( rethtmlcontent );  

  	return "";
  },
	addDeviceUpdater : function() {
		console.log("adding grp updater to " + this.id);
	//console.log("no modules found within group - generating them");
	// now add all devices of that group to the html skeleton
	for (k=0; k < this.device.devicelist.length; k++) {

		dynobj = new window[this.device.devicelist[k].getStyle()](this.device.devicelist[k]); 

		$("#"+this.device.id+"_tablegrp2content").append(dynobj.getHTML());

		if (this.device.devicelist[k].getHWID() != "dummy" && this.device.devicelist[k].getHWID() != undefined )  {				
			dynobj.addDeviceUpdater();
		}	
		this.modulelist.push(dynobj);

	}
	},
	stopDeviceUpdater : function() { 
		// stop updater for all children of that group...
		// the group itself should not have an updater but if it does remove that listener here, too
		for (i=0; i < this.modulelist.length; i++) {
			this.modulelist[i].stopDeviceUpdater();
		}
	
	},
  startDeviceUpdater : function() {
		// (re)start updater for all children of that group...
		// the group itself should not have an updater but if it does remove that listener here, too
		//console.log("starting grp updater");
		for (i=0; i < this.modulelist.length; i++) {
			this.modulelist[i].startDeviceUpdater();
		}
  },
  addClickListener : function() { 
	console.log("adding onClick listener to all childs of group2");
	for (l=0; l < this.modulelist.length; l++) {
			this.modulelist[l].addClickListener();
		}
  },
  onClick : function() { 
  },
  removeClickListener : function() { 
  }


});


