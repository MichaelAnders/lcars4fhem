mygroup = Widget.extend({
  modulelist: null,
  initialize: function(obj) {
	this.device = obj;
	this.id = this.device.id;
//	this.uniquehwid = this.id +"_"+ Math.floor(Math.random() * (9999 - 0 + 1)) + 0;
//	this.uniquehwid = this.uniquehwid.replace(".","_");
	this.modulelist = new Array();
  },
  getHTML: function() {

	url = window.location.href.toString().split(window.location.host)[1];
	url = url.replace("index.html","modules/group/group.html");

	// this must be done "dirty" otherwise the ajax request doesn't know about that variable :(
	var rethtmlcontent = "";
	var tmpglobaldevid = this.device.id;
	var groupid = this.uniquehwid;

	// initially cache this content at first call in order to reduce server requests

	$.ajax({
		url: url,
		type: "GET",
		async: false,
		cache: true,
		dataType: "html",
		success: function(result){
			rethtmlcontent = result;
			rethtmlcontent = rethtmlcontent.replace("groupid",groupid);
			rethtmlcontent = rethtmlcontent.replace("grpcpt",tmpglobaldevid+"_grpcpt");
			rethtmlcontent = rethtmlcontent.replace("grpbdy",tmpglobaldevid+"_grpbdy");


	    }
	});

	$("#content").append( rethtmlcontent );  
   	$("#"+this.device.id+"_grpcpt").html(this.device.caption);

  	return "";
  },
	addDeviceUpdater : function() {
		console.log("adding grp updater to " + this.id);
	//console.log("no modules found within group - generating them");
	// now add all devices of that group to the html skeleton
	for (k=0; k < this.device.devicelist.length; k++) {

		dynobj = new window[this.device.devicelist[k].getStyle()](this.device.devicelist[k]); 

		$("#"+this.device.id+"_grpbdy").append(dynobj.getHTML());

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
	//console.log("adding onClick listener to all childs of group");
		for (l=0; l < this.modulelist.length; l++) {
			this.modulelist[l].addClickListener();
		}
  },
  onClick : function() { 
  },
  removeClickListener : function() { 
  }

});



