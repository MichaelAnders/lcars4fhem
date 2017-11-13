/**

Version: 0.1.2a


Changelog:
0.1.2a
- added first test version of draggable frames


0.1.1a
- started moving to jsonlist2

0.1.0a
- changed js framework to jquery
- added error checks to device updater

0.0.9b
- renamed getHWId to getHWID
- added onClickListener to Module in order to handle actors
- removed modulelist from device
- renamed Module to Widget
*/

function Class(obj) {
  // Baue Konstruktor, der die angegebenen Eigenschaften in der Prototype-Eigenschaft erhält.
  var Constructor = function() {
    if (this.initialize) this.initialize.apply(this, arguments);
  }
  Constructor.prototype = obj;
  return Constructor;
}
 
Function.prototype.mixin = function(obj) {
  // Erweitere die Prototype-Eigenschaft einer Klasse um ein paar Funktionen.
  for (field in obj) this.prototype[field] = obj[field];
  return this;
}
 
Function.prototype.extend = function(obj) {
  // Baue aus einer bestehenden Klasse eine neue mit erweiterter Prototype-Eigenschaft.
  return Class(new this).mixin(obj);
}

MenuItem = Class({
  id: "",
  label: "",
  initialize: function(id,label) {
    this.id = id;
    this.label = label;
  }
});


// parent class for devices
Device = Class({
  hwid: null,
  uniquehwid: null,
  reading: null,
  unit: null,
  uival: 60,
  displayname: null,
  style: null,
  getHWID: function() { return this.hwid; },
  getReading: function() { return this.reading; },
  getStyle: function() { return this.style;  },
  getUpdateInterval: function() { return this.uival; },
  getUniqueHWID: function() { return this.uniquehwid; },
  getUnit: function() { return this.unit; },
  getDisplayname: function() { return this.displayname; },
  initialize: function(hwid,reading,unit,ival,displayname,style) {
    this.hwid = hwid;
	this.uniquehwid = this.hwid +"_"+ Math.floor(Math.random() * (9999 - 0 + 1)) + 0;
	this.uniquehwid = this.uniquehwid.replace(".","_");

    this.reading = reading;
    this.unit = unit;
    this.uival = ival * 1000;
    this.displayname = displayname;
    this.style = style;  
  }
});

Group = Class({
  id: null,
  caption: null,
  style: null,
  devicelist : null,
  initialize: function(id,caption,style) { 
	this.id = id.replace(".","_"); 
	this.id = this.id
    this.caption = caption;
    this.style = style;
	this.devicelist = new Array();
  },
  getStyle: function() { 
    return this.style;  
  },
  addDevice: function(device) {
		if ( (device != null) && (device != undefined) ) this.devicelist.push(device);
  },
  getHTML: function() { }
});

View = Class({
  id: null,
  caption: null,
  devicelist : null,
  modulelist : null,
  cachedhtml : null,
  initialize: function(id) { 
	this.id = id; 
	this.caption = null;
	this.cachedhtml = null;
  	this.devicelist = new Array();
	this.modulelist = new Array();
  },
  addDevice: function(device) {
		if ( (device != null) && (device != undefined) ) this.devicelist.push(device);
  },
  getDevices: function() {
  	return this.devicelist;
  }
});

// parent class for visual modules
Widget = Class({
  id: null,
  device: null,
  initialize: function(device) { 
	this.id = null;
	this.device = device; 
  },
  getHTML: function() { },
  addDeviceUpdater : function() { },
  startDeviceUpdater : function() { },
  stopDeviceUpdater : function() { },
  addClickListener : function() { },
  onClick : function() { },
  removeClickListener : function() { }
});

function parse_config( ) {
 	$.ajax({
		url: "config.xml",
		type: "GET",
		async: false,
		cache: true,	
		dataType: "xml",	
		success: function(result){

			var xmlresult = result;

			$(result).find("menu").find("view").each(function()
			{
				//console.log( $(this).attr("id") + " -> " + $(this).text() );
				eitem = new MenuItem( $(this).attr("id") , $(this).text());				
				arr_menuitems.push(eitem);

			});

			//console.log("----");

			$(result).find("views").find("view").each(function()
			{
				var viewitems = $(this).children();

				myview = new View($(this).attr("id"));
				//console.log("processing view: " + $(this).attr("id"));

				$.each(viewitems, function( index,viewelem ) {
  					//console.log("item: " + index + " > " +viewelem.nodeName + " --- " + viewelem.getAttribute("hwid") );

					if ( viewelem.nodeName == "group") {
						//console.log("got group");

						grp = new Group(viewelem.getAttribute("id"), viewelem.getAttribute("caption"), viewelem.getAttribute("style") );

						var viewgroupitems = $(this).children();
						$.each(viewgroupitems, function( index,viewgrpelem ) {
							// console.log("grpitem: " + index + " > " +viewgrpelem.nodeName + " --- " + viewgrpelem.getAttribute("hwid") );

							id = viewgrpelem.getAttribute("hwid");

							reading = viewgrpelem.getAttribute("reading");
							unit = viewgrpelem.getAttribute("unit");
							if (unit == null) unit="";
							uival = viewgrpelem.getAttribute("updateInterval");
							displayname = viewgrpelem.getAttribute("displayname");
							style = viewgrpelem.getAttribute("style");
							
							tmpdev = new Device(id,reading,unit,uival,displayname,style);	
							grp.addDevice( tmpdev );																 	

						});
						myview.addDevice(grp);
					} else {
						// common device
							id = viewelem.getAttribute("hwid");
							reading = viewelem.getAttribute("reading");
							unit = viewelem.getAttribute("unit");
							if (unit == null) unit="";
							uival = viewelem.getAttribute("updateInterval");
							displayname = viewelem.getAttribute("displayname");
							style = viewelem.getAttribute("style");
							
							tmpdev = new Device(id,reading,unit,uival,displayname,style);							
							myview.addDevice( tmpdev );						
					}
					array_views[myview.id] = myview;
				}); // end each view


			});
			console.log("done parsing menu");
	    }
	});
			build_menu();			

}

/*
@brief generates the menu
*/
function build_menu() {

	for (i=0; i < arr_menuitems.length; i++) {
		$( "#menu" ).append('<div class="menu_button" onclick="load_view(\''+arr_menuitems[i].id+'\', \''+arr_menuitems[i].label+'\');" >'+arr_menuitems[i].label +'</div> ');
	}
	// finally insert a dummy
	$( "#menu" ).append(  '<div></div>' );	


}


/*
@brief loads a given view and displays it in the "content" area".
@param id (string) of the view id
@param caption (string) of the view caption
*/
function load_view(id,caption) {



	// retrieve view class from array of all view provided by id
	myview = array_views[id];

	// if there is view present abort to avoid errors
	if (myview == null) {
		//console.log("seems like that view is NULL");
		return;
	}	

	// when there was already a view marked as current_view and this view is not equal to the new one remove old listeners. otherwise abort
	if (current_view != null) {
		if (current_view.id == myview.id) {
			//console.log("already in that view - abort further processing");	
			return;
		} else {
			// stop updaters from old view to reduce server requests and improve performance
			for (y=0; y < current_view.modulelist.length; y++) {	
				//console.log("trying to remove updater from: " + current_view.modulelist[y].hwid + " - " + y+"/"+(current_view.modulelist.length-1) );	
				current_view.modulelist[y].stopDeviceUpdater();
		
			}			
		}
	}

	// set new view as current_view
	 old_view = current_view;
	 current_view = myview;


	if (caption == undefined) caption = "";

	// set caption
	$( "#room_view" ).html(caption);

	// check whether we already generated modules for this view or not...

	if (myview.cachedhtml == null) {

		if (old_view != null) {
			//console.log("old stuff is: " + $("#content").html() );
			array_views[old_view.id].cachedhtml = $("#content").html();
		}
		// reset current view
		$( "#content" ).html("");
		console.log("no cached html available - gotta cache now");
		for (z=0; z < myview.getDevices().length; z++) {
				tmpdev = myview.getDevices()[z];

				if (window[tmpdev.getStyle()] != undefined) {		
		
					// create new visual object aka "module"
					var dynobj = new window[tmpdev.getStyle()](tmpdev); 

					$( "#content" ).append( dynobj.getHTML() );									
					// add a device updater				
					dynobj.addDeviceUpdater();	
					// add onClick listener
					dynobj.addClickListener();
					// add current module to modulelist in view
					array_views[id].modulelist.push(dynobj);
				} else {
					alert ( "missing module definition! " + myview.getDevices()[z].getStyle() );
				}		
		}

		// cache newly generated 
		array_views[id].cachedhtml = $("#content").html();

		// get rid of flex layout streching things in the middle
		//$('content').insert("<div style=\"max-height:10px;height:100%;width:100%\"></div>");
	} else {
		console.log("got cached html! :) ");	
		console.log("recaching old page with id: " + old_view.id);
		//console.log( $("#content").html() );
		array_views[old_view.id].cachedhtml = $("#content").html();
		// reset current view
		$( "#content" ).html("");
		// replace content by new html
		//console.log("using cached stuff : " + array_views[myview.id].cachedhtml );
		$( "#content" ).append(array_views[myview.id].cachedhtml);

		// re-adding device updater and click listener...
		for (j=0; j < myview.modulelist.length; j++) {
			// not sure why object modulelist gets broken from time to time -.- using this dirty workaround
			myview.modulelist[j].startDeviceUpdater();
			myview.modulelist[j].addClickListener();					
		}
	}


// ###
/*
var $container = $('#content').packery({
  columnWidth: 80,
  rowHeight: 80
});


var $itemElems = $container.find('.group');
// make item elements draggable

$itemElems.draggable();
// bind Draggable events to Packery
$container.packery( 'bindUIDraggableEvents', $itemElems );

//###
*/

	var $container = $('#content').packery({
		columnWidth: 80,
		rowHeight: 80
	});

	if (1 == 0) { // todo - add a toggle
	$container.find('.group').each( function( i, itemElem ) {
		// make element draggable with Draggabilly
		var draggie = new Draggabilly( itemElem );
		// bind Draggabilly events to Packery
		$container.packery( 'bindDraggabillyEvents', draggie );
	});
	}

	$('#content').height("100%");
}

function showTime() {
      //var Wochentagname = new Array("SONNTAG", "MONTAG", "DIENSTAG", "MITTWOCH",
      //                              "DONNERSTAG", "FREITAG", "SAMSTAG");
    var Jetzt = new Date();
      var Tag = Jetzt.getDate();
      var Monat = Jetzt.getMonth() + 1;
      var Jahr = Jetzt.getYear();
      if (Jahr < 999)
        Jahr += 1900;
      var Stunden = Jetzt.getHours();
      var Minuten = Jetzt.getMinutes();
      var Sekunden = Jetzt.getSeconds();
      var WoTag = Jetzt.getDay();
      var Vortag = (Tag < 10) ? "0" : "";
      var Vormon = (Monat < 10) ? ".0" : ".";
      var Vorstd = (Stunden < 10) ? "0" : "";
      var Vormin = (Minuten < 10) ? ":0" : ":";
      var Vorsek = (Sekunden < 10) ? ":0" : ":";
      var Datum = Vortag + Tag + Vormon + Monat + "." + Jahr;
      var Uhrzeit = Vorstd + Stunden + Vormin + Minuten + Vorsek + Sekunden;
      var Gesamt = "DATE:" + Datum + " • TIME:" + Uhrzeit; 
      //Wochentagname[WoTag] + " | " +   
        
       document.getElementById('Uhr').innerHTML = Gesamt;
	var t = setTimeout(function(){ showTime() },1000);     
}




